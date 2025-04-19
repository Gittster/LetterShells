import * as THREE from './three.module.js';

class STLExporter {

	parse(scene, options = {}) {

		const binary = options.binary !== undefined ? options.binary : false;

		const objects = [];
		let triangles = 0;

		scene.traverse(function (object) {

			if (!object.isMesh) return;

			const geometry = object.geometry;

			if (geometry.isBufferGeometry !== true) {
				throw new Error('STLExporter: Geometry is not of type BufferGeometry.');
			}

			const index = geometry.index;
			const positionAttribute = geometry.getAttribute('position');

			triangles += (index !== null) ? (index.count / 3) : (positionAttribute.count / 3);

			objects.push({
				geometry: geometry,
				matrixWorld: object.matrixWorld
			});

		});

		let output;

		if (binary === true) {

			const bufferLength = 80 + 4 + (triangles * 50); // header + triangle count + triangles
			const arrayBuffer = new ArrayBuffer(bufferLength);
			const outputView = new DataView(arrayBuffer);

			let offset = 80;
			outputView.setUint32(offset, triangles, true); offset += 4;

			const writeVector3 = function (offset, vector) {
				outputView.setFloat32(offset, vector.x, true); offset += 4;
				outputView.setFloat32(offset, vector.y, true); offset += 4;
				outputView.setFloat32(offset, vector.z, true); offset += 4;
				return offset;
			};

			const vA = new THREE.Vector3();
			const vB = new THREE.Vector3();
			const vC = new THREE.Vector3();
			const cb = new THREE.Vector3();
			const ab = new THREE.Vector3();

			for (let i = 0, il = objects.length; i < il; i++) {

				const object = objects[i];

				const geometry = object.geometry;
				const index = geometry.index;
				const positionAttribute = geometry.getAttribute('position');

				if (index !== null) {

					for (let j = 0; j < index.count; j += 3) {

						vA.fromBufferAttribute(positionAttribute, index.getX(j + 0));
						vB.fromBufferAttribute(positionAttribute, index.getX(j + 1));
						vC.fromBufferAttribute(positionAttribute, index.getX(j + 2));

						vA.applyMatrix4(object.matrixWorld);
						vB.applyMatrix4(object.matrixWorld);
						vC.applyMatrix4(object.matrixWorld);

						cb.subVectors(vC, vB);
						ab.subVectors(vA, vB);
						cb.cross(ab).normalize();

						offset = writeVector3(offset, cb);
						offset = writeVector3(offset, vA);
						offset = writeVector3(offset, vB);
						offset = writeVector3(offset, vC);

						outputView.setUint16(offset, 0, true); offset += 2;
					}

				} else {

					for (let j = 0; j < positionAttribute.count; j += 3) {

						vA.fromBufferAttribute(positionAttribute, j + 0);
						vB.fromBufferAttribute(positionAttribute, j + 1);
						vC.fromBufferAttribute(positionAttribute, j + 2);

						vA.applyMatrix4(object.matrixWorld);
						vB.applyMatrix4(object.matrixWorld);
						vC.applyMatrix4(object.matrixWorld);

						cb.subVectors(vC, vB);
						ab.subVectors(vA, vB);
						cb.cross(ab).normalize();

						offset = writeVector3(offset, cb);
						offset = writeVector3(offset, vA);
						offset = writeVector3(offset, vB);
						offset = writeVector3(offset, vC);

						outputView.setUint16(offset, 0, true); offset += 2;
					}
				}
			}

			output = arrayBuffer;

		} else {

			output = '';

			output += 'solid exported\n';

			const vA = new THREE.Vector3();
			const vB = new THREE.Vector3();
			const vC = new THREE.Vector3();
			const cb = new THREE.Vector3();
			const ab = new THREE.Vector3();

			for (let i = 0, il = objects.length; i < il; i++) {

				const object = objects[i];

				const geometry = object.geometry;
				const index = geometry.index;
				const positionAttribute = geometry.getAttribute('position');

				if (index !== null) {

					for (let j = 0; j < index.count; j += 3) {

						vA.fromBufferAttribute(positionAttribute, index.getX(j + 0));
						vB.fromBufferAttribute(positionAttribute, index.getX(j + 1));
						vC.fromBufferAttribute(positionAttribute, index.getX(j + 2));

						vA.applyMatrix4(object.matrixWorld);
						vB.applyMatrix4(object.matrixWorld);
						vC.applyMatrix4(object.matrixWorld);

						cb.subVectors(vC, vB);
						ab.subVectors(vA, vB);
						cb.cross(ab).normalize();

						output += '\tfacet normal ' + cb.x + ' ' + cb.y + ' ' + cb.z + '\n';
						output += '\t\touter loop\n';
						output += '\t\t\tvertex ' + vA.x + ' ' + vA.y + ' ' + vA.z + '\n';
						output += '\t\t\tvertex ' + vB.x + ' ' + vB.y + ' ' + vB.z + '\n';
						output += '\t\t\tvertex ' + vC.x + ' ' + vC.y + ' ' + vC.z + '\n';
						output += '\t\tendloop\n';
						output += '\tendfacet\n';
					}

				} else {

					for (let j = 0; j < positionAttribute.count; j += 3) {

						vA.fromBufferAttribute(positionAttribute, j + 0);
						vB.fromBufferAttribute(positionAttribute, j + 1);
						vC.fromBufferAttribute(positionAttribute, j + 2);

						vA.applyMatrix4(object.matrixWorld);
						vB.applyMatrix4(object.matrixWorld);
						vC.applyMatrix4(object.matrixWorld);

						cb.subVectors(vC, vB);
						ab.subVectors(vA, vB);
						cb.cross(ab).normalize();

						output += '\tfacet normal ' + cb.x + ' ' + cb.y + ' ' + cb.z + '\n';
						output += '\t\touter loop\n';
						output += '\t\t\tvertex ' + vA.x + ' ' + vA.y + ' ' + vA.z + '\n';
						output += '\t\t\tvertex ' + vB.x + ' ' + vB.y + ' ' + vB.z + '\n';
						output += '\t\t\tvertex ' + vC.x + ' ' + vC.y + ' ' + vC.z + '\n';
						output += '\t\tendloop\n';
						output += '\tendfacet\n';
					}
				}
			}

			output += 'endsolid exported\n';
		}

		return output;
	}
}

export { STLExporter };
