import { getDixFormula } from '@/shared/gpr-math';
import type { CmpLayer } from './data-slice-stores';

class CmpLayersContainer {
  layers: CmpLayer[] = [];

  addLayer(time: number, rmsVelocity: number) {
    this.insertLayer(crypto.randomUUID(), time, rmsVelocity);
  }

  removeLayer(id: string) {
    const index = this.layers.findIndex((layer) => layer.id === id);
    if (index === -1) {
      throw new Error(`Layer with id "${id}" does not exist`);
    }

    const earlyLayers = this.layers.slice(0, index);
    const laterLayers = this.layers.slice(index + 1);
    const precedingLayer = earlyLayers[earlyLayers.length - 1];

    this.layers = [
      ...earlyLayers,
      ...this.recalculateLayers(laterLayers, precedingLayer),
    ];
  }

  updateLayer(id: string, time: number, rmsVelocity: number) {
    if (!this.layers.some((layer) => layer.id === id)) {
      throw new Error(`Layer with id "${id}" does not exist`);
    }

    this.layers = this.layers.filter((layer) => layer.id !== id);
    this.insertLayer(id, time, rmsVelocity);
  }

  clone(): CmpLayersContainer {
    const copy = new CmpLayersContainer();
    copy.layers = this.layers;
    return copy;
  }

  private insertLayer(id: string, time: number, rmsVelocity: number) {
    const earlyLayers = this.layers.filter((l) => l.time < time);
    const laterLayers = this.layers.filter((l) => l.time > time);
    const precedingLayer = earlyLayers[earlyLayers.length - 1];

    const newLayer = this.calculateLayer(id, time, rmsVelocity, precedingLayer);

    this.layers = [
      ...earlyLayers,
      newLayer,
      ...this.recalculateLayers(laterLayers, newLayer),
    ];
  }

  private recalculateLayers(
    layers: CmpLayer[],
    precedingLayer: CmpLayer | undefined,
  ): CmpLayer[] {
    const recalculated: CmpLayer[] = [];
    let preceding = precedingLayer;
    for (const layer of layers) {
      const updated = this.calculateLayer(
        layer.id,
        layer.time,
        layer.rmsVelocity,
        preceding,
      );
      recalculated.push(updated);
      preceding = updated;
    }
    return recalculated;
  }

  private calculateLayer(
    id: string,
    time: number,
    rmsVelocity: number,
    precedingLayer: CmpLayer | undefined,
  ): CmpLayer {
    const velocity = precedingLayer
      ? getDixFormula(
          time,
          rmsVelocity,
          precedingLayer.time,
          precedingLayer.rmsVelocity,
        )
      : rmsVelocity;
    const dt = time - (precedingLayer?.time ?? 0);
    const thickness = (dt * velocity) / 2;
    const totalThickness = precedingLayer
      ? thickness + precedingLayer.totalThickness
      : thickness;

    return { id, time, rmsVelocity, velocity, totalThickness, thickness };
  }
}

export default CmpLayersContainer;
