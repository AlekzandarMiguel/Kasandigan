import pymysql

pymysql.install_as_MySQLdb()

# Compatibility patch for MariaDB / MySQL versions without RETURNING or native UUID support (e.g. MariaDB 10.4 in XAMPP)
from django.db.backends.mysql.base import DatabaseWrapper
from django.db.backends.mysql.features import DatabaseFeatures
from django.db.backends.mysql.schema import DatabaseSchemaEditor

DatabaseWrapper.check_database_version_supported = lambda self: None
DatabaseFeatures.can_return_columns_from_insert = False
DatabaseFeatures.has_native_uuid_field = False

def custom_rename_field_sql(self, table, old_field, new_field, new_type):
    new_type = self._set_field_new_type(old_field, new_type)
    return (
        f'ALTER TABLE {self.quote_name(table)} CHANGE COLUMN '
        f'{self.quote_name(old_field.column)} {self.quote_name(new_field.column)} {new_type}'
    )
DatabaseSchemaEditor._rename_field_sql = custom_rename_field_sql
