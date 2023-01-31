provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = "${var.location}"

  tags = "${var.common_tags}"
}

resource "azurerm_application_insights" "appinsights" {
  name                = "${var.product}-${var.component}-appinsights-${var.env}"
  location            = "${var.appinsights_location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  application_type    = "Web"

  tags = "${var.common_tags}"
}

data "azurerm_key_vault" "div_key_vault" {
  name                = local.vaultName
  resource_group_name = local.vaultName
}

data "azurerm_key_vault_secret" "frontend_secret" {
  name      = "frontend-secret"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "idam_secret" {
  name      = "idam-secret"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "post_code_token" {
  name      = "os-places-token"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "session_secret" {
  name      = "session-secret"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "redis_secret" {
  name      = "redis-secret"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name = "${var.component}-redis-connection-string"
  value = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "launchdarkly_key" {
  name      = "launchdarkly-key"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "idamCitizenEmail" {
  name      = "idam-citizen-username"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "idamCitizenPassword" {
  name      = "idam-citizen-password"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

data "azurerm_key_vault_secret" "appinsights_secret" {
  name = "AppInsightsInstrumentationKey"
  key_vault_id = data.azurerm_key_vault.div_key_vault.id
}

locals {
  aseName                             = "core-compute-${var.env}"
  public_hostname                     = "div-pfe-${var.env}.service.${local.aseName}.internal"

  local_env                           = (var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env

  previewVaultName                    = "${var.reform_team}-aat"
  nonPreviewVaultName                 = "${var.reform_team}-${var.env}"
  vaultName                           = (var.env == "preview" || var.env == "spreview") ? local.previewVaultName : local.nonPreviewVaultName

  service_auth_provider_url           = var.service_auth_provider_url == "" ? "http://${var.idam_s2s_url_prefix}-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.service_auth_provider_url

  case_orchestration_service_url      = var.case_orchestration_service_url == "" ? "http://div-cos-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.case_orchestration_service_url
  evidence_management_client_api_url  = var.evidence_management_client_api_url == "" ? "http://div-emca-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.evidence_management_client_api_url
  fees_and_payments_url               = var.fees_and_payments_url == "" ? "http://div-fps-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.fees_and_payments_url
  decree_nisi_frontend_url            = var.decree_nisi_frontend_url == "" ? "https://div-dn-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.decree_nisi_frontend_url

  status_health_endpoint             = "/status/health"

  asp_name = var.env == "prod" ? "div-pfe-prod" : "${var.raw_product}-${var.env}"
  asp_rg   = var.env == "prod" ? "div-pfe-prod" : "${var.raw_product}-${var.env}"

  appinsights_name           = var.env == "preview" ? "${var.product}-${var.component}-appinsights-${var.env}" : "${var.product}-${var.env}"
  appinsights_resource_group = var.env == "preview" ? "${var.product}-${var.component}-${var.env}" : "${var.product}-${var.env}"
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

module "redis-cache" {
  source      = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product     = var.env != "preview" ? "${var.product}-redis" : "${var.product}-${var.component}-redis"
  location    = var.location
  env         = var.env
  subnetid    = data.azurerm_subnet.core_infra_redis_subnet.id
  common_tags = var.common_tags
}

