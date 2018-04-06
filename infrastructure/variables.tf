// Infrastructural variables

variable "product" {
  default = "div"
}

variable "microservice" {
  default = "frontend"
}

variable "location" {
  default = "UK South"
}

variable "env" {
  default = "sandbox"
}

variable "ilbIp" { }

variable "deployment_env" {
  default = "test"
}

variable "deployment_path" {
  default = "/opt/divorce/frontend"
}

variable "node_config_dir" {
  // for Unix
  // default = "/opt/divorce/frontend/config"
  
  // for Windows
  default = "D:\\home\\site\\wwwroot\\config"
}

variable "subscription" {}

variable "vault_section" {
  default = "test"
}

// CNP settings
variable "jenkins_AAD_objectId" {
  type                        = "string"
  description                 = "(Required) The Azure AD object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies."
}

variable "tenant_id" {
  description = "(Required) The Azure Active Directory tenant ID that should be used for authenticating requests to the key vault. This is usually sourced from environemnt variables and not normally required to be specified."
}

variable "client_id" {
  description = "(Required) The object ID of a user, service principal or security group in the Azure Active Directory tenant for the vault. The object ID must be unique for the list of access policies. This is usually sourced from environment variables and not normally required to be specified."
}

variable "node_env" {
  // https://www.dynatrace.com/news/blog/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/
  default = "production"
}

variable "node_path" {
  default = "."
}

variable "external_host_name" {
  default = "divorce.sandbox.platform.hmcts.net"
}

// Package details
variable "packages_name" {
  default = "frontend"
}

variable "packages_project" {
  default = "divorce"
}

variable "packages_environment" {
  default = "test"
}

variable "packages_version" {
  default = "-1"
}

variable "version" {
  default = "-1"
}

variable "divorce_frontend_service_name" {
  default = "divorce-frontend"
}

variable "divorce_frontend_protocol" {
  default = "https"
}

variable "divorce_frontend_hostname" {
  default = "div-frontend-sandbox.service.core-compute-sandbox.internal"
}

variable "divorce_frontend_public_port" {
  default = "443"
}

variable "divorce_frontend_port" {
  default = "3001"
}

variable "outbound_proxy" {
  default = "http://proxyout.reform.hmcts.net:8080/"
}

variable "no_proxy" {
  default = "localhost,127.0.0.0/8,127.0.0.1,127.0.0.1*,local.home,reform.hmcts.net,*.reform.hmcts.net,betaDevBdivorceAppLB.reform.hmcts.net,betaDevBccidamAppLB.reform.hmcts.net,*.internal,*.platform.hmcts.net"
}

variable "ga_tracking_id" {
  description = "Google Analytics tracking ID"
  default = "UA-93824767-2"
}

variable "ga_tracking_url" {
  description = "Google Analytics tracking URL"
  default = "http://www.google-analytics.com/collect"
}

variable "divorce_redis_url" {
  default = "betaDevBdivorceCache01.reform.hmcts.net:6379"
}

variable "use_auth" {
  default = "false"
}

variable "health_endpoint" {
  default = "/health"
}

variable "status_health_endpoint" {
  default = "/status/health"
}

variable "idam_authentication_web_url" {
  default = "https://idam-test.dev.ccidam.reform.hmcts.net"
}

variable "idam_authentication_login_endpoint" {
  default = "/login"
}

variable "idam_api_url" {
  default = "http://betaDevBccidamAppLB.reform.hmcts.net"
}

variable "service_auth_provider_url" {
  default = "http://betaDevBccidamS2SLB.reform.hmcts.net"
}

variable "frontend_service_name" {
  default = "divorce-frontend"
}

variable "s2s_microservice_name" {
  default = "divorce_frontend"
}

variable "case_progression_service_url" {
  default = "http://betaDevBdivorceAppLB.reform.hmcts.net:4013"
}

variable "transformation_service_base_path" {
  default = "/transformationapi/version/1"
}

variable "draft_store_api_base_path" {
  default = "/draftsapi/version/1"
}

variable "evidence_management_client_api_url" {
  default = "http://betaDevBdivorceAppLB.reform.hmcts.net:4016"
}

variable "evidence_management_client_api_upload_endpoint" {
  default = "/emclientapi/version/1/uploadFiles"
}

variable "feature_toggle_api_url" {
  default = "http://betaDevBdivorceAppLB.reform.hmcts.net:4012"
}

variable "feature_toggle_api_base_path" {
  default = "/api/v1/feature-toggle"
}

variable "payments_api_url" {
  default = "https://test.payments.reform.hmcts.net:4421"
}

variable "payment_reference_service_id" {
  default = "DIV1"
}

variable "fee_register_url" {
  default = "https://test.fees-register.reform.hmcts.net:4431"
}

variable "post_code_url" {
  default = "https://postcodeinfo.service.justice.gov.uk"
}

variable "hpkp_max_age" {
  default = "86400"
}

variable "hpkp_sha256s" {
  default = "Naw+prhcXSIkbtYJ0t7vAD+Fc92DWL9UZevVfWBvids=,klO23nT2ehFDXCfx3eHTDRESMz3asj1muO+4aIdjiuY=,grX4Ta9HpZx6tSHkmCrvpApTQGo67CYDnvprLg5yRME="
}

variable "rate_limiter_total" {
  default = "3600"
}

variable "rate_limiter_expire" {
  default = "3600000"
}

// Feature toggles
variable "feature_jurisdiction" {
  default = "false"
}

variable "feature_new_jurisdiction" {
  default = "true"
}

variable "feature_idam" {
  default = "false"
}

variable "feature_foreign_marriage_certs" {
  default = "false"
}

variable "feature_court_southamption" {
  default = "false"
}

// Dynamic content
variable "survey_feedback_url" {
  default = "http://www.smartsurvey.co.uk/s/0QIL4"
}

variable "survey_feedback_done_url" {
  default = "http://www.smartsurvey.co.uk/s/8RR1T"
}

variable "court_phone_number" {
  default = "0300 303 0642"
}

variable "court_opening_hours" {
  default = "Monday to Friday, 8.30am to 5pm"
}

variable "court_email" {
  default = "Divorce_Reform_Pro@Justice.gov.uk"
}

variable "court_eastmidlands_court_weight" {
  default = "0.18"
}

variable "court_westmidlands_court_weight" {
  default = "0.20"
}

variable "court_southwest_court_weight" {
  default = "0.36"
}

variable "court_northwest_court_weight" {
  default = "0.26"
}

variable "e2e_wait_for_timeout" {
  default = "60000"
}

variable "e2e_wait_for_action" {
  default = "3000"
}
