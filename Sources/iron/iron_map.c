
#include "iron_map.h"
#define STB_DS_IMPLEMENTATION
#include <stb_ds.h>

void i32_map_set(i32_map_t *m, char *k, int v) {
	shput(m->hash, k, v);
}

void any_map_set(any_map_t *m, char *k, void *v) {
	shput(m->hash, k, v);
}

int32_t i32_map_get(i32_map_t *m, void *k) {
	return shget(m->hash, k);
}

void *any_map_get(any_map_t *m, void *k) {
	return shget(m->hash, k);
}

void map_delete(any_map_t *m, void *k) {

}

void *map_to_array(any_map_t *m) {
	return NULL;
}
