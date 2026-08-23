-- Do not count sessions created before first-party quality collection.
-- They remain available for restricted audit, but are not presented as verified traffic.
update visitor_sessions
set traffic_class = 'legacy_unclassified',
    exclusion_reason = coalesce(exclusion_reason, 'pre_quality_upgrade')
where site_id = 'bzmagnet'
  and visitor_key is null
  and traffic_class = 'valid';

update analytics_events
set traffic_class = 'legacy_unclassified'
where site_id = 'bzmagnet'
  and visitor_key is null
  and traffic_class = 'valid';
