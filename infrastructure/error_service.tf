module "send-alert-service-error" {
  source            = "git@github.com:hmcts/cnp-module-metric-alert"
  location          = "${var.appinsights_location}"
  app_insights_name = "${local.appinsights_name}"

  alert_name = "User access with error"
  alert_desc = "User with empty reason divorce list."

  app_insights_query = <<EOF
traces
| extend itemType = iif(itemType == 'trace',itemType,"")
| where (((* has 'Marriage' and * has 'date') and * has 'is') and * has 'empty')
EOF

  frequency_in_minutes       = 10
  time_window_in_minutes     = 10
  severity_level             = "3"
  action_group_name          = "${module.error-service-group.action_group_name}"
  custom_email_subject       = "User with empty reason list"
  trigger_threshold_operator = "GreaterThan"
  trigger_threshold          = 0
  resourcegroup_name         = "${local.appinsights_resource_group}"
}
