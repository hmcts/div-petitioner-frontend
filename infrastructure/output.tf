output "vaultUri" {
  value = "${module.petitioner-frontend-vault.key_vault_uri}"
}

output "vaultName" {
  value = "${module.petitioner-frontend-vault.key_vault_name}"
}
