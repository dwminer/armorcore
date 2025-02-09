#pragma once

#include <stdint.h>
#include <stdbool.h>
#include "iron_array.h"

char *string_join(char *a, char *b);
int string_length(char *str);
bool string_equals(char *a, char *b);
char * i32_to_string(int32_t i);

int32_t string_index_of(char *s, char *search);
int32_t string_last_index_of(char *s, char *search);
any_array_t *string_split(char *s, char *sep);
void string_replace_all(char *s, char *search, char *replace);
char *substring(char *s, int32_t start, int32_t end);
char *string_from_char_code(int32_t c);
int32_t char_code_at(char *s, int32_t i);
char *char_at(char *s, int32_t i);
bool starts_with(char *s, char *start);
bool ends_with(char *s, char *end);
char *to_lower_case(char *s);
char *trim_end(char *str);
