provider "azurerm" {
  version = "1.44.0"
}

data "azurerm_key_vault" "div_key_vault" {
  name                = "${local.vaultName}"
  resource_group_name = "${local.vaultName}"
}

data "azurerm_key_vault_secret" "redis_secret" {
  name      = "redis-secret"
  key_vault_id = "${data.azurerm_key_vault.div_key_vault.id}"
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name = "${var.component}-redis-connection-string"
  value = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
  key_vault_id = "${data.azurerm_key_vault.div_key_vault.id}"
}

locals {
  aseName                             = "core-compute-${var.env}"

  previewVaultName                    = "${var.reform_team}-aat"
  nonPreviewVaultName                 = "${var.reform_team}-${var.env}"
  vaultName                           = "${(var.env == "preview" || var.env == "spreview") ? local.previewVaultName : local.nonPreviewVaultName}"
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

module "redis-cache" {
  source      = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product     = "${var.env != "preview" ? "${var.product}-redis" : "${var.product}-${var.component}-redis"}"
  location    = "${var.location}"
  env         = "${var.env}"
  subnetid    = "${data.azurerm_subnet.core_infra_redis_subnet.id}"
  common_tags = "${var.common_tags}"
}
