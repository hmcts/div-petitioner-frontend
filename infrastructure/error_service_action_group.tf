module "error-service-group" {
  source   = "git@github.com:hmcts/cnp-module-action-group"
  location = "global"
  env      = "${var.env}"

  resourcegroup_name     = "${local.appinsights_resource_group}"
  action_group_name      = "user-with-empty-reason-list-${var.env}"
  short_name             = "NoRsnAlert"
  email_receiver_name    = "Divorce team"
  email_receiver_address = "${var.dev_support_notification_email}"
}
output "action_group_name" {
  value = "${module.error-service-group.action_group_name}"
}
