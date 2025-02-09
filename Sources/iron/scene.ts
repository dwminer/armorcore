
let scene_camera: camera_object_t;
let scene_world: world_data_t;
let scene_meshes: mesh_object_t[];
let scene_lights: light_object_t[];
let scene_cameras: camera_object_t[];
///if arm_audio
let scene_speakers: speaker_object_t[];
///end
let scene_empties: object_t[];
let scene_animations: anim_raw_t[];
///if arm_skin
let scene_armatures: armature_t[];
///end
let scene_embedded: map_t<string, image_t>;

let _scene_ready: bool;
let _scene_uid_counter: i32 = 0;
let _scene_uid: i32;
let _scene_raw: scene_t;
let _scene_root: object_t;
let _scene_scene_parent: object_t;
let _scene_objects_traversed: i32;
let _scene_objects_count: i32;

function scene_create(format: scene_t): object_t {
	_scene_uid = _scene_uid_counter++;
	scene_meshes = [];
	scene_lights = [];
	scene_cameras = [];
	///if arm_audio
	scene_speakers = [];
	///end
	scene_empties = [];
	scene_animations = [];
	///if arm_skin
	scene_armatures = [];
	///end
	scene_embedded = map_create();
	_scene_root = object_create();
	_scene_root.name = "Root";

	_scene_ready = false;
	_scene_raw = format;

	scene_world = data_get_world(format.name, format.world_ref);

	// Startup scene
	let scene_object: object_t = scene_add_scene(format.name, null);
	if (scene_cameras.length == 0) {
		krom_log("No camera found for scene '" + format.name + "'");
	}

	scene_camera = scene_get_camera(format.camera_ref);
	_scene_scene_parent = scene_object;
	_scene_ready = true;
	return scene_object;
}

function scene_remove() {
	for (let i: i32 = 0; i < scene_meshes.length; ++i) {
		let o: mesh_object_t = scene_meshes[i];
		mesh_object_remove(o);
	}
	for (let i: i32 = 0; i < scene_lights.length; ++i) {
		let o: light_object_t = scene_lights[i];
		light_object_remove(o);
	}
	for (let i: i32 = 0; i < scene_cameras.length; ++i) {
		let o: camera_object_t = scene_cameras[i];
		camera_object_remove(o);
	}
	///if arm_audio
	for (let i: i32 = 0; i < scene_speakers.length; ++i) {
		let o: speaker_object_t = scene_speakers[i];
		speaker_object_remove(o);
	}
	///end
	for (let i: i32 = 0; i < scene_empties.length; ++i) {
		let o: object_t = scene_empties[i];
		object_remove(o);
	}
	object_remove(_scene_root);
}

function scene_set_active(scene_name: string): object_t {
	if (_scene_root != null) {
		scene_remove();
	}

	///if arm_voxels // Revoxelize
	_render_path_voxelized = 0;
	///end

	let format: scene_t = data_get_scene_raw(scene_name);
	let o: object_t = scene_create(format);
	return o;
}

function scene_update_frame() {
	if (!_scene_ready) {
		return;
	}
	for (let i: i32 = 0; i < scene_animations.length; ++i) {
		let anim: anim_raw_t = scene_animations[i];
		anim_update(anim, time_delta());
	}
	for (let i: i32 = 0; i < scene_empties.length; ++i) {
		let e: object_t = scene_empties[i];
		if (e != null && e.parent != null) {
			transform_update(e.transform);
		}
	}
}

function scene_render_frame() {
	if (!_scene_ready || render_path_commands == null) {
		return;
	}

	// Render active camera
	scene_camera != null ? camera_object_render_frame(scene_camera) : render_path_render_frame();
}

// Objects
function scene_add_object(parent: object_t = null): object_t {
	let object: object_t = object_create();
	parent != null ? object_set_parent(object, parent) : object_set_parent(object, _scene_root);
	return object;
}

function scene_get_child(name: string): object_t {
	return object_get_child(_scene_root, name);
}

function scene_get_mesh(name: string): mesh_object_t {
	for (let i: i32 = 0; i < scene_meshes.length; ++i) {
		let m: mesh_object_t = scene_meshes[i];
		if (m.base.name == name) {
			return m;
		}
	}
	return null;
}

function scene_get_light(name: string): light_object_t {
	for (let i: i32 = 0; i < scene_lights.length; ++i) {
		let l: light_object_t = scene_lights[i];
		if (l.base.name == name) {
			return l;
		}
	}
	return null;
}

function scene_get_camera(name: string): camera_object_t {
	for (let i: i32 = 0; i < scene_cameras.length; ++i) {
		let c: camera_object_t = scene_cameras[i];
		if (c.base.name == name) {
			return c;
		}
	}
	return null;
}

///if arm_audio
function scene_get_speaker(name: string): speaker_object_t {
	for (let i: i32 = 0; i < scene_speakers.length; ++i) {
		let s: speaker_object_t = scene_speakers[i];
		if (s.base.name == name) {
			return s;
		}
	}
	return null;
}
///end

function scene_get_empty(name: string): object_t {
	for (let i: i32 = 0; i < scene_empties.length; ++i) {
		let e: object_t = scene_empties[i];
		if (e.name == name) {
			return e;
		}
	}
	return null;
}

function scene_add_mesh_object(data: mesh_data_t, materials: material_data_t[], parent: object_t = null): mesh_object_t {
	let object: mesh_object_t = mesh_object_create(data, materials);
	parent != null ? object_set_parent(object.base, parent) : object_set_parent(object.base, _scene_root);
	return object;
}

function scene_add_light_object(data: light_data_t, parent: object_t = null): light_object_t {
	let object: light_object_t = light_object_create(data);
	parent != null ? object_set_parent(object.base, parent) : object_set_parent(object.base, _scene_root);
	return object;
}

function scene_add_camera_object(data: camera_data_t, parent: object_t = null): camera_object_t {
	let object: camera_object_t = camera_object_create(data);
	parent != null ? object_set_parent(object.base, parent) : object_set_parent(object.base, _scene_root);
	return object;
}

///if arm_audio
function scene_add_speaker_object(data: speaker_data_t, parent: object_t = null): speaker_object_t {
	let object: speaker_object_t = speaker_object_create(data);
	parent != null ? object_set_parent(object.base, parent) : object_set_parent(object.base, _scene_root);
	return object;
}
///end

function scene_traverse_objects(format: scene_t, parent: object_t, objects: obj_t[], parent_object: obj_t) {
	if (objects == null) {
		return;
	}
	for (let i: i32 = 0; i < objects.length; ++i) {
		let o: obj_t = objects[i];
		if (o.spawn != null && o.spawn == false) {
			continue; // Do not auto-create Scene object
		}

		let object: object_t = scene_create_object(o, format, parent, parent_object);
		scene_traverse_objects(format, object, o.children, o);
	}
}

function scene_add_scene(scene_name: string, parent: object_t): object_t {
	if (parent == null) {
		parent = scene_add_object();
		parent.name = scene_name;
	}
	let format: scene_t = data_get_scene_raw(scene_name);
	scene_load_embedded_data(format.embedded_datas); // Additional scene assets
	_scene_objects_traversed = 0;
	_scene_objects_count = scene_get_objects_count(format.objects);

	if (format.objects != null && format.objects.length > 0) {
		scene_traverse_objects(format, parent, format.objects, null); // Scene objects
	}
	return parent;
}

function scene_get_objects_count(objects: obj_t[]): i32 {
	if (objects == null) {
		return 0;
	}
	let result: i32 = objects.length;
	for (let i: i32 = 0; i < objects.length; ++i) {
		let o: obj_t = objects[i];
		if (o.spawn != null && o.spawn == false) {
			continue; // Do not count children of non-spawned objects
		}
		if (o.children != null) {
			result += scene_get_objects_count(o.children);
		}
	}
	return result;
}

function _scene_spawn_object_tree(obj: obj_t, parent: object_t, parent_object: obj_t, spawn_children: bool): object_t {
	let object: object_t = scene_create_object(obj, _scene_raw, parent, parent_object);
	if (spawn_children && obj.children != null) {
		for (let i: i32 = 0; i < obj.children.length; ++i) {
			let child: obj_t = obj.children[i];
			_scene_spawn_object_tree(child, object, obj, spawn_children);
		}
	}
	return object;
}

function scene_spawn_object(name: string, parent: object_t = null, spawn_children: bool = true): object_t {
	let obj: obj_t = scene_get_raw_object_by_name(_scene_raw, name);
	return _scene_spawn_object_tree(obj, parent, null, spawn_children);
}

function scene_get_raw_object_by_name(format: scene_t, name: string): obj_t {
	return scene_traverse_objs(format.objects, name);
}

function scene_traverse_objs(children: obj_t[], name: string): obj_t {
	for (let i: i32 = 0; i < children.length; ++i) {
		let o: obj_t = children[i];
		if (o.name == name) {
			return o;
		}
		if (o.children != null) {
			let res: obj_t = scene_traverse_objs(o.children, name);
			if (res != null) {
				return res;
			}
		}
	}
	return null;
}

function scene_create_object(o: obj_t, format: scene_t, parent: object_t, parent_object: obj_t): object_t {
	let scene_name: string = format.name;

	if (o.type == "camera_object") {
		let b: camera_data_t = data_get_camera(scene_name, o.data_ref);
		let object: camera_object_t = scene_add_camera_object(b, parent);
		return scene_return_object(object.base, o);
	}
	else if (o.type == "light_object") {
		let b: light_data_t = data_get_light(scene_name, o.data_ref);
		let object: light_object_t = scene_add_light_object(b, parent);
		return scene_return_object(object.base, o);
	}
	else if (o.type == "mesh_object") {
		if (o.material_refs == null || o.material_refs.length == 0) {
			return scene_create_mesh_object(o, format, parent, parent_object, null);
		}
		else {
			// Materials
			let materials: material_data_t[] = [];
			for (let i: i32 = 0; i < o.material_refs.length; ++i) {
				let ref: string = o.material_refs[i];
				let mat: material_data_t = data_get_material(scene_name, ref);
				array_push(materials, mat);
			}
			return scene_create_mesh_object(o, format, parent, parent_object, materials);
		}
	}
	///if arm_audio
	else if (o.type == "speaker_object") {
		let object: speaker_object_t = scene_add_speaker_object(speaker_data_get_raw_by_name(format.speaker_datas, o.data_ref), parent);
		return scene_return_object(object.base, o);
	}
	///end
	else if (o.type == "object") {
		let object: object_t = scene_add_object(parent);
		return scene_return_object(object, o);
	}
	else {
		return null;
	}
}

function scene_create_mesh_object(o: obj_t, format: scene_t, parent: object_t, parent_object: obj_t, materials: material_data_t[]): object_t {
	// Mesh reference
	let ref: string[] = string_split(o.data_ref, "/");
	let object_file: string = "";
	let data_ref: string = "";
	let scene_name: string = format.name;
	if (ref.length == 2) { // File reference
		object_file = ref[0];
		data_ref = ref[1];
	}
	else { // Local mesh data
		object_file = scene_name;
		data_ref = o.data_ref;
	}

	// Bone objects are stored in armature parent
	///if arm_skin
	if (parent_object != null && parent_object.anim != null && parent_object.anim.bone_actions != null) {
		let bactions: scene_t[] = [];
		for (let i: i32 = 0; i < parent_object.anim.bone_actions.length; ++i) {
			let ref: string = parent_object.anim.bone_actions[i];
			let action: scene_t = data_get_scene_raw(ref);
			array_push(bactions, action);
		}
		let armature: armature_t = null;
		// Check if armature exists
		for (let j: i32 = 0; j < scene_armatures.length; ++j) {
			let a: armature_t = scene_armatures[j];
			if (a.uid == parent.uid) {
				armature = a;
				break;
			}
		}
		// Create new one
		if (armature == null) {
			// Unique name if armature was already instantiated for different object
			for (let j: i32 = 0; j < scene_armatures.length; ++j) {
				let a: armature_t = scene_armatures[j];
				if (a.name == parent.name) {
					parent.name += "." + parent.uid;
					break;
				}
			}
			armature = armature_create(parent.uid, parent.name, bactions);
			array_push(scene_armatures, armature);
		}
		return scene_return_mesh_object(
			object_file, data_ref, scene_name, armature, materials, parent, parent_object, o);
	}
	///end

	return scene_return_mesh_object(object_file, data_ref, scene_name, null, materials, parent, parent_object, o);
}

function scene_return_mesh_object(object_file: string, data_ref: string, scene_name: string, armature: any, // armature_t
	materials: material_data_t[], parent: object_t, parent_object: obj_t, o: obj_t): object_t {

	let mesh: mesh_data_t = data_get_mesh(object_file, data_ref);
	///if arm_skin
	if (mesh.skin != null) {
		armature != null ? mesh_data_add_armature(mesh, armature) : mesh_data_add_action(mesh, _scene_raw.objects, "none");
	}
	///end
	let object: mesh_object_t = scene_add_mesh_object(mesh, materials, parent);

	// Attach particle systems
	///if arm_particles
	if (o.particles != null && o.particles.refs != null) {
		for (let i: i32 = 0; i < o.particles.refs.length; ++i) {
			let ref: particle_ref_t = o.particles.refs[i];
			mesh_object_setup_particle_system(object, scene_name, ref);
		}
	}
	///end
	return scene_return_object(object.base, o);
}

function scene_return_object(object: object_t, o: obj_t): object_t {
	// Load object actions
	if (object != null && o.anim != null && o.anim.object_actions != null) {
		let oactions: scene_t[] = [];
		while (oactions.length < o.anim.object_actions.length) {
			array_push(oactions, null);
		}

		for (let i: i32 = 0; i < o.anim.object_actions.length; ++i) {
			let ref: string = o.anim.object_actions[i];
			if (ref == "null") { // No startup action set
				continue;
			}
			let action: scene_t = data_get_scene_raw(ref);
			oactions[i] = action;
		}
		return scene_return_object_loaded(object, o, oactions);
	}
	else {
		return scene_return_object_loaded(object, o, null);
	}
}

function scene_return_object_loaded(object: object_t, o: obj_t, oactions: scene_t[]): object_t {
	if (object != null) {
		object.raw = o;
		object.name = o.name;
		if (o.visible != null) {
			object.visible = o.visible;
		}
		scene_gen_transform(o, object.transform);
		object_setup_animation(object, oactions);
	}
	return object;
}

function scene_gen_transform(object: obj_t, transform: transform_t) {
	transform.world = object.transform != null ? mat4_from_f32_array(object.transform) : mat4_identity();
	mat4_decompose(transform.world, transform.loc, transform.rot, transform.scale);
	if (transform.object.parent != null) {
		transform_update(transform);
	}
}

function scene_load_embedded_data(datas: string[]) {
	if (datas == null) {
		return;
	}
	for (let i: i32 = 0; i < datas.length; ++i) {
		let file: string = datas[i];
		scene_embed_data(file);
	}
}

function scene_embed_data(file: string) {
	if (ends_with(file, ".raw")) {
		let b: buffer_t = data_get_blob(file);
		// Raw 3D texture bytes
		let w: i32 = math_floor(math_pow(buffer_size(b), 1 / 3)) + 1;
		let image: image_t = image_from_bytes_3d(b, w, w, w, tex_format_t.R8);
		map_set(scene_embedded, file, image);
	}
	else {
		let image: image_t = data_get_image(file);
		map_set(scene_embedded, file, image);
	}
}
