const actual_weights_over_time = (user_id, time_zone, goal_start_date, goal_end_date) => {
  const actual_weights_daily_applicable_dates = require("./actual_weights_daily_applicable_dates")(
    user_id,
    time_zone,
    goal_start_date,
    goal_end_date
  );
  return `


    select 
      d.user_id,
      d.observation_date,
      ubd.actual_weight_kg
    from ${actual_weights_daily_applicable_dates} -- as d
    inner join user_budget_data as ubd
    on 
      d.user_id = ubd.user_id and
      d.applicable_date = ubd.applicable_date
    order by
      d.user_id,
      d.observation_date


  `;
};

module.exports = actual_weights_over_time;
