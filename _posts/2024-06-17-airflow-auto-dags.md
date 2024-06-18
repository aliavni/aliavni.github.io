---
title: "Generate Airflow DAGs automatically"
date: 2024-06-17 15:10:00 -0400

layout: single
categories: airflow python
tags: airflow python

header:
  overlay_image: /assets/airflow-auto-dags/dag-a.png
  teaser: /assets/images/airflow-logo.png
---

Sometimes, your dags are so similar that generating multiple dags would be a waste.



## Code

We will use a config file based approach to create as many dags as we want. Everything in the config files will be used to auto-generate dags. It supports setting various dag parameters:

1. Start time
2. Schedule
3. Catchup
4. And the tasks in the dag

### Config files

Config json for the first dag

```json
{
  "dag_id": "auto_dag_a",
  "start": "2024-06-15T00:00:00",
  "schedule": "@once",
  "catchup": false,
  "task_ids": ["start", "task_1", "end"]
}
```


Config json for the second dag

```json
{
  "dag_id": "auto_dag_b",
  "start": "2024-06-14T00:00:00",
  "schedule": null,
  "catchup": false,
  "task_ids": ["start", "task_1", "task_2", "end"]
}
```

### Generating DAGs

This is the code that generates dags based on the json files. You should save this file in the root directory of the dags where Airflow Scheduler can find and process.

```python
import glob
import json
from dataclasses import asdict, dataclass
from typing import Union, List

import pendulum
from airflow import DAG
from airflow.operators.empty import EmptyOperator
from pendulum import DateTime


@dataclass
class DagConfig:
    dag_id: str
    schedule: Union[str, None]
    catchup: bool
    start: Union[str, None]
    task_ids: List[str]

    @property
    def start_date(self) -> DateTime:
        return pendulum.parse(self.start)



def auto_generate_dag(config: DagConfig) -> DAG:
    """Generate and return a dag"""

    doc_md = f"""
    # Auto generated dag

    Generated with this config: ```{asdict(config)}```
    """
    dag = DAG(
        dag_id=config.dag_id,
        description=f"Auto generated dag: {config.dag_id}",
        schedule=config.schedule,
        catchup=config.catchup,
        start_date=config.start_date,
        doc_md=doc_md,
        tags=["auto"]
    )

    return dag


def get_dag_configs() -> list[DagConfig]:
    """Read all dag config json files and return a list of `DagConfig`s"""
    dag_configs = []
    for file_path in glob.glob("dags/dag_configs/*.json"):
        with open(file_path, "r") as f:
            dag_config_json = json.load(f)
            dag_config = DagConfig(**dag_config_json)
            dag_configs.append(dag_config)

    return dag_configs


def add_tasks_to_dag(dag: DAG, dag_config: DagConfig) -> None:
    previous_task = None
    for task_id in dag_config.task_ids:
        task = EmptyOperator(task_id=task_id, dag=dag)

        if previous_task is not None:
            previous_task.set_downstream(task)

        previous_task = task


def generate_dags() -> None:
    """Auto generate dags"""
    dag_configs = get_dag_configs()

    for dag_config in dag_configs:
        dag = auto_generate_dag(dag_config)
        add_tasks_to_dag(dag, dag_config)
        globals()[dag.dag_id] = dag


generate_dags()

```

## Results

### Airflow UI

Now we see the 2 dags in the Airflow UI

![2 dags in the Airflow UI]({{ site.url }}{{ site.baseurl }}/assets/airflow-auto-dags/airflow-ui.png)

### First dag's tasks

![First dag's tasks]({{ site.url }}{{ site.baseurl }}/assets/airflow-auto-dags/dag-a.png)

### Second dag's tasks

![Second dag's tasks]({{ site.url }}{{ site.baseurl }}/assets/airflow-auto-dags/dag-b.png)

## Caveats

This code will be executed very frequently by the Airflow Scheduler. This ensures that the dags will be up-to-date. However, you should not run expensive operations in this code otherwise scheduler may not function properly.

## Full code

You can check out the full code <a href="https://github.com/aliavni/docker/blob/main/airflow/dags/generator.py" target="_blank">here</a>. Let me know what you think in the comments.
