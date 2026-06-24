// Shrinks the point-cloud source GLB.
//
// ModelCloud.svelte only reads POSITION from this model to sample a 90k-point
// cloud — it never renders the mesh, materials, textures, normals or UVs. So we
// strip everything but geometry, decimate the triangle count (90k points from
// ~120k tris is visually identical to the full-res mesh), quantize positions and
// meshopt-compress. The result loads with three's GLTFLoader + MeshoptDecoder.
//
// Usage: node scripts/optimize-glb.mjs [in.glb] [out.glb] [simplifyRatio]
//   defaults: public/fixed.glb -> public/fixed.glb (in place), ratio 0.12

import { NodeIO } from '@gltf-transform/core';
import {
  EXTMeshoptCompression,
  KHRMeshQuantization,
  EXTTextureWebP,
} from '@gltf-transform/extensions';
import { prune, dedup, weld, simplify, quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

const SRC = process.argv[2] ?? 'public/fixed.glb';
const DST = process.argv[3] ?? SRC;
const RATIO = Number(process.argv[4] ?? 0.12);

await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;

const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization, EXTTextureWebP])
  .registerDependencies({
    'meshopt.encoder': MeshoptEncoder,
    'meshopt.decoder': MeshoptDecoder,
  });

const doc = await io.read(SRC);
const root = doc.getRoot();

// Keep only POSITION + indices on every primitive; drop materials.
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    prim.setMaterial(null);
    for (const sem of prim.listSemantics()) {
      if (sem !== 'POSITION') prim.setAttribute(sem, null);
    }
  }
}

const countTris = () => {
  let tris = 0;
  for (const mesh of root.listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const idx = prim.getIndices();
      const pos = prim.getAttribute('POSITION');
      if (pos) tris += (idx ? idx.getCount() : pos.getCount()) / 3;
    }
  return Math.round(tris);
};
const trisBefore = countTris();

await doc.transform(
  prune({ keepAttributes: false, keepLeaves: false }),
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: RATIO, error: 0.005 }),
  prune(),
  quantize({ quantizePosition: 14 }),
);

// Drop any now-unused extensions left on the document (e.g. the source's
// EXT_texture_webp) so the output declares only what it actually uses.
for (const ext of root.listExtensionsUsed()) {
  if (ext.extensionName !== EXTMeshoptCompression.EXTENSION_NAME &&
      ext.extensionName !== KHRMeshQuantization.EXTENSION_NAME) {
    ext.dispose();
  }
}

doc
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });

await io.write(DST, doc);

console.log(`triangles: ${trisBefore.toLocaleString()} -> ${countTris().toLocaleString()}`);
console.log(`wrote ${DST}`);
