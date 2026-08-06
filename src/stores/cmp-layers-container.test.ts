import { describe, expect, it } from 'vitest';
import CmpLayersContainer from './cmp-layers-container';
import { getDixFormula } from '@/shared/gpr-math';

describe('addLayer', () => {
  it('should add a first layer', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);

    const layers = container.layers;
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject({ time: 10, rmsVelocity: 0.1 });
    expect(layers[0].id).toBeTruthy();
  });

  it('should add a second layer', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);

    const layers = container.layers;
    expect(layers).toHaveLength(2);
    expect(layers.map((l) => l.time)).toEqual([10, 20]);
  });

  it('should calculate the velocity of a upper layer using rmsVelocity', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);

    const [layer] = container.layers;
    expect(layer.velocity).toBe(0.1);
    // thickness = (dt * velocity) / 2 = (10 * 0.1) / 2
    expect(layer.thickness).toBe(0.5);
    expect(layer.totalThickness).toBe(0.5);
  });

  it('should calculate the velocity of not earlier layer using dixFormula', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);

    const [first, second] = container.layers;
    const expectedVelocity = getDixFormula(20, 0.12, 10, 0.1);
    const expectedThickness = ((20 - 10) * expectedVelocity) / 2;

    expect(second.velocity).toBeCloseTo(expectedVelocity);
    expect(second.thickness).toBeCloseTo(expectedThickness);
    expect(second.totalThickness).toBeCloseTo(
      first.totalThickness + expectedThickness,
    );
  });

  it('should not recalculate velocities of the earlier layers', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    const [firstBefore] = container.layers;

    container.addLayer(20, 0.12);

    const [firstAfter] = container.layers;
    expect(firstAfter).toBe(firstBefore);
    expect(firstAfter.velocity).toBe(0.1);
  });

  it('should recalculate velocities of the later layers', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(30, 0.14);
    const [, lastBefore] = container.layers;

    container.addLayer(20, 0.12);

    const layers = container.layers;
    expect(layers.map((l) => l.time)).toEqual([10, 20, 30]);

    const [, middle, last] = layers;
    expect(last).not.toBe(lastBefore);
    expect(last.rmsVelocity).toBe(0.14);

    const expectedVelocity = getDixFormula(30, 0.14, 20, middle.rmsVelocity);
    expect(last.velocity).toBeCloseTo(expectedVelocity);
    expect(last.thickness).toBeCloseTo(
      last.totalThickness - middle.totalThickness,
    );
  });
});

describe('removeLayer', () => {
  it('should remove a layer', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);
    const [, second] = container.layers;

    container.removeLayer(second.id);

    const layers = container.layers;
    expect(layers).toHaveLength(1);
    expect(layers[0].time).toBe(10);
  });

  it('should not recalculate velocities of the earlier layers', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);
    container.addLayer(30, 0.14);
    const [first, , third] = container.layers;

    container.removeLayer(third.id);

    const [firstAfter] = container.layers;
    expect(firstAfter).toBe(first);
  });

  it('should recalculate velocities of the later layers', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);
    container.addLayer(30, 0.14);
    const [first, second, thirdBefore] = container.layers;

    container.removeLayer(second.id);

    const layers = container.layers;
    expect(layers.map((l) => l.time)).toEqual([10, 30]);

    const [, last] = layers;
    expect(last).not.toBe(thirdBefore);

    const expectedVelocity = getDixFormula(30, 0.14, 10, first.rmsVelocity);
    expect(last.velocity).toBeCloseTo(expectedVelocity);
    expect(last.thickness).toBeCloseTo(
      last.totalThickness - first.totalThickness,
    );
  });

  it('should throw an error if the layer does not exist', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);

    expect(() => container.removeLayer('unknown-id')).toThrow();
  });
});

describe('updateLayer', () => {
  it('should update a layer', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);
    const [, second] = container.layers;

    container.updateLayer(second.id, 25, 0.13);

    const layers = container.layers;
    expect(layers).toHaveLength(2);
    const updated = layers.find((l) => l.id === second.id);
    expect(updated).toMatchObject({ time: 25, rmsVelocity: 0.13 });
  });

  it('should not recalculate velocities of the earlier layers', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);
    container.addLayer(30, 0.14);
    const [first, second] = container.layers;

    container.updateLayer(second.id, 21, 0.121);

    const [firstAfter] = container.layers;
    expect(firstAfter).toBe(first);
  });

  it('should recalculate velocities of the later layers', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);
    container.addLayer(30, 0.14);
    const [, second, thirdBefore] = container.layers;

    container.updateLayer(second.id, 21, 0.121);

    const layers = container.layers;
    const updatedSecond = layers.find((l) => l.id === second.id)!;
    const updatedThird = layers.find((l) => l.id === thirdBefore.id)!;

    expect(updatedSecond.time).toBe(21);
    expect(updatedThird).not.toBe(thirdBefore);

    const expectedVelocity = getDixFormula(
      30,
      0.14,
      21,
      updatedSecond.rmsVelocity,
    );
    expect(updatedThird.velocity).toBeCloseTo(expectedVelocity);
    expect(updatedThird.thickness).toBeCloseTo(
      updatedThird.totalThickness - updatedSecond.totalThickness,
    );
  });

  it('should throw an error if the layer does not exist', () => {
    const container = new CmpLayersContainer();

    expect(() => container.updateLayer('unknown-id', 10, 0.1)).toThrow();
  });
});

describe('getLayers', () => {
  it('should return the layers', () => {
    const container = new CmpLayersContainer();

    container.addLayer(10, 0.1);
    container.addLayer(20, 0.12);

    const layers = container.layers;
    expect(layers).toHaveLength(2);
    expect(layers.map((l) => l.time)).toEqual([10, 20]);
  });
});
