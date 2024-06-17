

--------------------------------------------------
-- visualization data --------------------------------
--------------------------------------------------

create table vis_data as
select
  dbn,
  boro,
  trim(split_part(lat_lon, ',', 1)) as lat,
  trim(split_part(lat_lon, ',', 2)) as lon,
  CASE WHEN ontrack_year1_2013 = 'N/A' THEN NULL ELSE rtrim(ontrack_year1_2013, '%')::FLOAT / 100 END as ontrack_year1_2013,
  CASE WHEN graduation_rate_2013 = 'N/A' THEN NULL ELSE rtrim(graduation_rate_2013, '%')::FLOAT / 100 END as graduation_rate_2013,
  CASE WHEN college_career_rate_2013 = 'N/A' THEN NULL ELSE rtrim(college_career_rate_2013, '%')::FLOAT / 100 END as college_career_rate_2013,
  CASE WHEN student_satisfaction_2013 = 'N/A' THEN NULL ELSE rtrim(student_satisfaction_2013, '%')::FLOAT / 100 END as student_satisfaction_2013,
  CASE WHEN ontrack_year1_2012 = 'N/A' THEN NULL ELSE rtrim(ontrack_year1_2012, '%')::FLOAT / 100 END as ontrack_year1_2012,
  CASE WHEN graduation_rate_2012 = 'N/A' THEN NULL ELSE rtrim(graduation_rate_2012, '%')::FLOAT / 100 END as graduation_rate_2012,
  CASE WHEN college_career_rate_2012 = 'N/A' THEN NULL ELSE rtrim(college_career_rate_2012, '%')::FLOAT / 100 END as college_career_rate_2012,
  CASE WHEN student_satisfaction_2012 = 'N/A' THEN NULL ELSE rtrim(student_satisfaction_2012, '%')::FLOAT / 100 END as student_satisfaction_2012
from (
  select d.dbn, boro, trim(split_part(location_1, E'\n', 3), '()') lat_lon,
    ontrack_year1_2013,
    graduation_rate_2013,
    college_career_rate_2013,
    student_satisfaction_2013,
    ontrack_year1_2012,
    graduation_rate_2012,
    college_career_rate_2012,
    student_satisfaction_2012
  from hs_directory d
  join hs_performance p using(dbn)
  where ontrack_year1_2013 <> 'N/A'
AND graduation_rate_2013 <> 'N/A'
AND college_career_rate_2013 <> 'N/A'
AND student_satisfaction_2013 <> 'N/A'
AND ontrack_year1_2012 <> 'N/A'
AND graduation_rate_2012 <> 'N/A'
AND college_career_rate_2012 <> 'N/A'
AND student_satisfaction_2012 <> 'N/A'
) j
order by boro;

--------------------------------------------------
-- -----------------------------------------------
--------------------------------------------------

select boro, count(1)
from vis_data
group by boro
order by count;

select dbn, boro, graduation_rate_2012, graduation_rate_2013, *
from vis_data
where boro = 'Bronx'
and dbn = '07X600';

select boro, c, count(1)
from (
  select *,
  case
    when diff < 0 then 'dec'
    when diff > 0 then 'inc'
    else 'same'
  end as c
  from (
    select boro, graduation_rate_2012, graduation_rate_2013, graduation_rate_2013 - graduation_rate_2012 diff
    from vis_data
  ) d
) c
group by boro, c
order by boro, c;
