
type quat_t = {
	x?: f32;
	y?: f32;
	z?: f32;
	w?: f32;
	type?: string;
};

let _quat_vec: vec4_t = vec4_create();
let _quat_mat: mat4_t = mat4_identity();
let _quat_x_axis: vec4_t = vec4_x_axis();
let _quat_y_axis: vec4_t = vec4_y_axis();
let _quat_sqrt2: f32 = 1.4142135623730951;

function quat_create(x: f32 = 0.0, y: f32 = 0.0, z: f32 = 0.0, w: f32 = 1.0): quat_t {
	let self: quat_t = {};
	self.x = x;
	self.y = y;
	self.z = z;
	self.w = w;
	self.type = "quat_t";
	return self;
}

function quat_set(self: quat_t, x: f32, y: f32, z: f32, w: f32): quat_t {
	self.x = x;
	self.y = y;
	self.z = z;
	self.w = w;
	return self;
}

function quat_from_axis_angle(self: quat_t, axis: vec4_t, angle: f32): quat_t {
	let s: f32 = math_sin(angle * 0.5);
	self.x = axis.x * s;
	self.y = axis.y * s;
	self.z = axis.z * s;
	self.w = math_cos(angle * 0.5);
	return quat_normalize(self);
}

function quat_from_mat(self: quat_t, m: mat4_t): quat_t {
	mat4_set_from(_quat_mat, m);
	mat4_to_rot(_quat_mat);
	return quat_from_rot_mat(self, _quat_mat);
}

function quat_from_rot_mat(self: quat_t, m: mat4_t): quat_t {
	// Assumes the upper 3x3 is a pure rotation matrix
	let m11: f32 = m.m[0];
	let m12: f32 = m.m[4];
	let m13: f32 = m.m[8];
	let m21: f32 = m.m[1];
	let m22: f32 = m.m[5];
	let m23: f32 = m.m[9];
	let m31: f32 = m.m[2];
	let m32: f32 = m.m[6];
	let m33: f32 = m.m[10];
	let tr: f32 = m11 + m22 + m33;
	let s: f32 = 0.0;

	if (tr > 0) {
		s = 0.5 / math_sqrt(tr + 1.0);
		self.w = 0.25 / s;
		self.x = (m32 - m23) * s;
		self.y = (m13 - m31) * s;
		self.z = (m21 - m12) * s;
	}
	else if (m11 > m22 && m11 > m33) {
		s = 2.0 * math_sqrt(1.0 + m11 - m22 - m33);
		self.w = (m32 - m23) / s;
		self.x = 0.25 * s;
		self.y = (m12 + m21) / s;
		self.z = (m13 + m31) / s;
	}
	else if (m22 > m33) {
		s = 2.0 * math_sqrt(1.0 + m22 - m11 - m33);
		self.w = (m13 - m31) / s;
		self.x = (m12 + m21) / s;
		self.y = 0.25 * s;
		self.z = (m23 + m32) / s;
	}
	else {
		s = 2.0 * math_sqrt(1.0 + m33 - m11 - m22);
		self.w = (m21 - m12) / s;
		self.x = (m13 + m31) / s;
		self.y = (m23 + m32) / s;
		self.z = 0.25 * s;
	}
	return self;
}

function quat_mult(self: quat_t, q: quat_t): quat_t {
	return quat_mult_quats(self, self, q);
}

function quat_mult_quats(self: quat_t, q1: quat_t, q2: quat_t): quat_t {
	let q1x: f32 = q1.x;
	let q1y: f32 = q1.y;
	let q1z: f32 = q1.z;
	let q1w: f32 = q1.w;
	let q2x: f32 = q2.x;
	let q2y: f32 = q2.y;
	let q2z: f32 = q2.z;
	let q2w: f32 = q2.w;
	self.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y;
	self.y = q1w * q2y - q1x * q2z + q1y * q2w + q1z * q2x;
	self.z = q1w * q2z + q1x * q2y - q1y * q2x + q1z * q2w;
	self.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
	return self;
}

function quat_normalize(self: quat_t): quat_t {
	let l: f32 = math_sqrt(self.x * self.x + self.y * self.y + self.z * self.z + self.w * self.w);
	if (l == 0.0) {
		self.x = 0;
		self.y = 0;
		self.z = 0;
		self.w = 0;
	}
	else {
		l = 1.0 / l;
		self.x *= l;
		self.y *= l;
		self.z *= l;
		self.w *= l;
	}
	return self;
}

function quat_set_from(self: quat_t, q: quat_t): quat_t {
	self.x = q.x;
	self.y = q.y;
	self.z = q.z;
	self.w = q.w;
	return self;
}

function quat_get_euler(self: quat_t): vec4_t {
	let a: f32 = -2 * (self.x * self.z - self.w * self.y);
	let b: f32 =  self.w *  self.w + self.x * self.x - self.y * self.y - self.z * self.z;
	let c: f32 =  2 * (self.x * self.y + self.w * self.z);
	let d: f32 = -2 * (self.y * self.z - self.w * self.x);
	let e: f32 =  self.w *  self.w - self.x * self.x + self.y * self.y - self.z * self.z;
	return vec4_create(math_atan2(d, e), math_atan2(a, b), math_asin(c));
}

function quat_from_euler(self: quat_t, x: f32, y: f32, z: f32): quat_t {
	let f: f32 = x / 2;
	let c1: f32 = math_cos(f);
	let s1: f32 = math_sin(f);
	f = y / 2;
	let c2: f32 = math_cos(f);
	let s2: f32 = math_sin(f);
	f = z / 2;
	let c3: f32 = math_cos(f);
	let s3: f32 = math_sin(f);
	// YZX
	self.x = s1 * c2 * c3 + c1 * s2 * s3;
	self.y = c1 * s2 * c3 + s1 * c2 * s3;
	self.z = c1 * c2 * s3 - s1 * s2 * c3;
	self.w = c1 * c2 * c3 - s1 * s2 * s3;
	return self;
}

function quat_lerp(self: quat_t, from: quat_t, to: quat_t, s: f32): quat_t {
	let fromx: f32 = from.x;
	let fromy: f32 = from.y;
	let fromz: f32 = from.z;
	let fromw: f32 = from.w;
	let dot: f32 = quat_dot(from, to);
	if (dot < 0.0) {
		fromx = -fromx;
		fromy = -fromy;
		fromz = -fromz;
		fromw = -fromw;
	}
	self.x = fromx + (to.x - fromx) * s;
	self.y = fromy + (to.y - fromy) * s;
	self.z = fromz + (to.z - fromz) * s;
	self.w = fromw + (to.w - fromw) * s;
	return quat_normalize(self);
}

function quat_dot(self: quat_t, q: quat_t): f32 {
	return (self.x * q.x) + (self.y * q.y) + (self.z * q.z) + (self.w * q.w);
}

function quat_from_to(self: quat_t, v1: vec4_t, v2: vec4_t): quat_t {
	// Rotation formed by direction vectors
	// v1 and v2 should be normalized first
	let a: vec4_t = _quat_vec;
	let dot: f32 = vec4_dot(v1, v2);
	if (dot < -0.999999) {
		vec4_cross_vecs(a, _quat_x_axis, v1);
		if (vec4_len(a) < 0.000001) {
			vec4_cross_vecs(a, _quat_y_axis, v1);
		}
		vec4_normalize(a);
		quat_from_axis_angle(self, a, math_pi());
	}
	else if (dot > 0.999999) {
		quat_set(self, 0, 0, 0, 1);
	}
	else {
		vec4_cross_vecs(a, v1, v2);
		quat_set(self, a.x, a.y, a.z, 1 + dot);
		quat_normalize(self);
	}
	return self;
}
