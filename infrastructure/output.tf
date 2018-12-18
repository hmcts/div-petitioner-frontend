output "idam_api_url" {
  value = "${var.idam_api_url}"
}

output "case_orchestration_service_draft_url" {
  value = "${local.case_orchestration_service_url}${var.draft_store_api_base_path}"
}

output "feature_idam" {
  value = "${var.feature_idam}"
}

output "feature_full_payment_event_data_submission" {
  value = "${var.feature_full_payment_event_data_submission}"
}

output "feature_redirect_to_application_submitted" {
  value = "${var.feature_redirect_to_application_submitted}"
}

output "feature_respondent_consent" {
  value = "${var.feature_respondent_consent}"
}
