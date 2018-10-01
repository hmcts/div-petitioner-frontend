module "send-alert-service-error" {
  source            = "git@github.com:hmcts/cnp-module-metric-alert"
  location          = "${var.location}"
  app_insights_name = "${var.product}-appinsights-${var.env}"

  alert_name = "User access with error"
  alert_desc = "User with empty reason divorce list."

  app_insights_query = <<EOF
traces
| extend itemType = iif(itemType == 'trace',itemType,"")
| where * has 'Marriage date is empty '
EOF

  frequency_in_minutes       = 10
  time_window_in_minutes     = 10
  severity_level             = "3"
  action_group_name          = "${module.error-service-group.action_group_name}"
  custom_email_subject       = "Send Letter is DOWN"
  trigger_threshold_operator = "GreaterThan"
  trigger_threshold          = 0
  resourcegroup_name         = "${local.vaultName}"
}
