module "error-service-group" {
  source   = "git@github.com:hmcts/cnp-module-action-group"
  location = "global"
  env      = "${var.env}"

  resourcegroup_name     = "${local.vaultName}"
  action_group_name      = "User with empty reason list - ${var.env}"
  short_name             = "Empty_reason_list"
  email_receiver_name    = "Divorce team"
  email_receiver_address = "qiang.zhou@hmcts.net"
}

output "action_group_name" {
  value = "${module.error-service-group.action_group_name}"
}
