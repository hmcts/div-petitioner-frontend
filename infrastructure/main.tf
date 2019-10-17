provider "azurerm" {
  version = "1.22.1"
}

data "azurerm_key_vault" "div_key_vault" {
  name                = "${local.vaultName}"
  resource_group_name = "${local.vaultName}"
}

data "azurerm_key_vault_secret" "frontend_secret" {
  name      = "frontend-secret"
  key_vault_id = "${data.azurerm_key_vault.div_key_vault.id}"
}

data "azurerm_key_vault_secret" "idam_secret" {
  name      = "idam-secret"
  key_vault_id = "${data.azurerm_key_vault.div_key_vault.id}"
}

data "azurerm_key_vault_secret" "post_code_token" {
  name      = "os-places-token"
  key_vault_id = "${data.azurerm_key_vault.div_key_vault.id}"
}

data "azurerm_key_vault_secret" "session_secret" {
  name      = "session-secret"
  key_vault_id = "${data.azurerm_key_vault.div_key_vault.id}"
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
  public_hostname                     = "div-pfe-${var.env}.service.${local.aseName}.internal"

  local_env                           = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"

  previewVaultName                    = "${var.reform_team}-aat"
  nonPreviewVaultName                 = "${var.reform_team}-${var.env}"
  vaultName                           = "${(var.env == "preview" || var.env == "spreview") ? local.previewVaultName : local.nonPreviewVaultName}"

  service_auth_provider_url           = "${var.service_auth_provider_url == "" ? "http://${var.idam_s2s_url_prefix}-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.service_auth_provider_url}"

  case_orchestration_service_url      = "${var.case_orchestration_service_url == "" ? "http://div-cos-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.case_orchestration_service_url}"
  evidence_management_client_api_url  = "${var.evidence_management_client_api_url == "" ? "http://div-emca-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.evidence_management_client_api_url}"
  fees_and_payments_url               = "${var.fees_and_payments_url == "" ? "http://div-fps-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.fees_and_payments_url}"
  decree_nisi_frontend_url            = "${var.decree_nisi_frontend_url == "" ? "https://div-dn-${local.local_env}.service.core-compute-${local.local_env}.internal" : var.decree_nisi_frontend_url}"

  status_health_endpoint             = "/status/health"

  asp_name = "${var.env == "prod" ? "div-pfe-prod" : "${var.raw_product}-${var.env}"}"
  asp_rg   = "${var.env == "prod" ? "div-pfe-prod" : "${var.raw_product}-${var.env}"}"

  appinsights_name           = "${var.env == "preview" ? "${var.product}-${var.component}-appinsights-${var.env}" : "${var.product}-${var.env}"}"
  appinsights_resource_group = "${var.env == "preview" ? "${var.product}-${var.component}-${var.env}" : "${var.product}-${var.env}"}"
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

module "frontend" {
  source                          = "git@github.com:hmcts/cnp-module-webapp?ref=master"
  product                         = "${var.product}-${var.component}"
  location                        = "${var.location}"
  env                             = "${var.env}"
  ilbIp                           = "${var.ilbIp}"
  is_frontend                     = "${var.env != "preview" ? 1: 0}"
  subscription                    = "${var.subscription}"
  appinsights_instrumentation_key = "${var.appinsights_instrumentation_key}"
  additional_host_name            = "${var.env != "preview" ? var.additional_host_name : "null"}"
  https_only                      = "false"
  capacity                        = "${var.capacity}"
  common_tags                     = "${var.common_tags}"
  asp_name                        = "${local.asp_name}"
  asp_rg                          = "${local.asp_rg}"
  instance_size                   = "${var.instance_size}"

  app_settings = {
    // Node specific vars
    NODE_ENV  = "${var.node_env}"
    NODE_PATH = "${var.node_path}"
    WEBSITE_NODE_DEFAULT_VERSION = "${var.node_version}"

    UV_THREADPOOL_SIZE = "${var.uv_threadpool_size}"
    NODE_CONFIG_DIR    = "${var.node_config_dir}"

    // Logging vars
    REFORM_TEAM         = "${var.reform_team}"
    REFORM_SERVICE_NAME = "${var.component}"
    REFORM_ENVIRONMENT  = "${var.env}"

    // Packages
    PACKAGES_NAME        = "${var.packages_name}"
    PACKAGES_PROJECT     = "${var.packages_project}"
    PACKAGES_ENVIRONMENT = "${var.packages_environment}"
    PACKAGES_VERSION     = "${var.packages_version}"

    DEPLOYMENT_ENV = "${var.deployment_env}"

    // Frontend web details
    PUBLIC_HOSTNAME    = "${local.public_hostname}"
    PUBLIC_PROTOCOL    = "${var.public_protocol}"
    DIVORCE_HTTP_PROXY = "${var.http_proxy}"
    no_proxy           = "${var.no_proxy}"

    // Service name
    SERVICE_NAME = "${var.frontend_service_name}"

    // IDAM
    IDAM_API_URL                       = "${var.idam_api_url}"
    IDAM_APP_HEALHCHECK_URL            = "${var.idam_api_url}${var.health_endpoint}"
    IDAM_LOGIN_URL                     = "${var.idam_authentication_web_url}${var.idam_authentication_login_endpoint}"
    IDAM_AUTHENTICATION_HEALHCHECK_URL = "${var.idam_authentication_web_url}${var.health_endpoint}"
    IDAM_SECRET                        = "${data.azurerm_key_vault_secret.idam_secret.value}"
    IDAM_CLIENT_ID                     = "${var.idam_client_id}"

    // Service Auth
    SERVICE_AUTH_PROVIDER_URL             = "${local.service_auth_provider_url}"
    SERVICE_AUTH_PROVIDER_HEALTHCHECK_URL = "${local.service_auth_provider_url}${var.health_endpoint}"
    MICROSERVICE_NAME                     = "${var.s2s_microservice_name}"
    MICROSERVICE_KEY                      = "${data.azurerm_key_vault_secret.frontend_secret.value}"

    // Payments API
    PAYMENT_SERVICE_URL                      = "${var.payment_service_url}"
    PAYMENT_SERVICE_HEALTHCHECK_URL          = "${var.payment_service_url}${var.health_endpoint}"
    PAYMENT_REFERENCE_SERVICE_IDENTIFICATION = "${var.payment_reference_service_id}"

    // Fees API
    FEES_AND_PAYMENTS_URL             = "${local.fees_and_payments_url}"
    FEES_AND_PAYMENTS_HEALTHCHECK_URL = "${local.fees_and_payments_url}${var.health_endpoint}"

    // Post code Lookup
    POST_CODE_URL          = "${var.post_code_url}"
    POST_CODE_ACCESS_TOKEN = "${data.azurerm_key_vault_secret.post_code_token.value}"

    // Redis Cloud
    REDISCLOUD_URL = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
    USE_AUTH       = "${var.use_auth}"

    // Encryption secrets
    SECRET                    = "${data.azurerm_key_vault_secret.session_secret.value}"
    SESSION_ENCRYPTION_SECRET = "${data.azurerm_key_vault_secret.redis_secret.value}"

    // Evidence Management Client API
    EVIDENCE_MANAGEMENT_CLIENT_API_URL             = "${local.evidence_management_client_api_url}"
    EVIDENCE_MANAGEMENT_CLIENT_API_HEALTHCHECK_URL = "${local.evidence_management_client_api_url}${var.evidence_management_client_api_url == "" ? var.health_endpoint : local.status_health_endpoint}"
    EVIDENCE_MANAGEMENT_CLIENT_API_UPLOAD_ENDPOINT = "${var.evidence_management_client_api_upload_endpoint}"

    // Case Orchestration Service
    CASE_ORCHESTRATION_SERVICE_URL             = "${local.case_orchestration_service_url}${var.case_orchestration_base_path}"
    CASE_ORCHESTRATION_SERVICE_HEALTHCHECK_URL = "${local.case_orchestration_service_url}${var.health_endpoint}"

    // Draft Store API
    CASE_ORCHESTRATION_SERVICE_DRAFT_URL = "${local.case_orchestration_service_url}${var.draft_store_api_base_path}"

    // Decree Nisi Frontend Url
    DECREE_NISI_FRONTEND_URL = "${local.decree_nisi_frontend_url}"

    // Common Court Content
    SMARTSURVEY_FEEDBACK_URL      = "${var.survey_feedback_url}"
    SMARTSURVEY_FEEDBACK_DONE_URL = "${var.survey_feedback_done_url}"
    COURT_PHONENUMBER             = "${var.court_phone_number}"
    COURT_OPENINGHOURS            = "${var.court_opening_hours}"
    COURT_EMAIL                   = "${var.court_email}"

    // HPKP
    HPKP_MAX_AGE = "${var.hpkp_max_age}"
    HPKP_SHAS    = "${var.hpkp_shas}"

    // Google Anayltics
    GOOGLE_ANALYTICS_ID           = "${var.google_analytics_tracking_id}"
    GOOGLE_ANALYTICS_TRACKING_URL = "${var.google_analytics_tracking_url}"

    // Rate Limiter
    RATE_LIMITER_TOTAL  = "${var.rate_limiter_total}"
    RATE_LIMITER_EXPIRE = "${var.rate_limiter_expire}"

    // Feature toggling through config
    FEATURE_IDAM                            = "${var.feature_idam}"
    FEATURE_STRATEGIC_PAY                   = "${var.feature_strategic_pay}"
    FEATURE_WEBCHAT                         = "${var.feature_webchat}"

    WEBCHAT_CHAT_ID = "${var.webchat_chat_id}"
    WEBCHAT_TENANT = "${var.webchat_tenant}"
    WEBCHAT_BUTTON_NO_AGENTS = "${var.webchat_button_no_agents}"
    WEBCHAT_BUTTON_AGENTS_BUSY = "${var.webchat_button_agents_busy}"
    WEBCHAT_BUTTON_SERVICE_CLOSED = "${var.webchat_button_service_closed}"
  }
}
