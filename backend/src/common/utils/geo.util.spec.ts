import { calculateDistanceMeters } from './geo.util';

describe('calculateDistanceMeters', () => {
  it('mengembalikan 0 untuk dua titik koordinat yang identik', () => {
    const jarak = calculateDistanceMeters(-6.2088, 106.8456, -6.2088, 106.8456);
    expect(jarak).toBe(0);
  });

    it('menghitung jarak 1 derajat lintang di khatulistiwa dengan akurat', () => {
    // 1 derajat lintang di mana pun di bumi = radius bumi x (π/180) ≈ 111,195 meter.
    // Ini bisa dihitung manual dari rumus, bukan ditaksir dari peta -- jadi assertion ini
    // benar-benar independen dan bisa diverifikasi ulang kapan saja.
    const jarak = calculateDistanceMeters(0, 0, 1, 0);
    const expected = (Math.PI / 180) * 6371000; // ≈ 111194.9 meter

    expect(jarak).toBeCloseTo(expected, 0); // toleransi ke satuan meter
    });

  it('menghasilkan jarak yang sama tanpa peduli urutan titik (simetris)', () => {
    const jarakAB = calculateDistanceMeters(-6.2088, 106.8456, -6.1754, 106.8272);
    const jarakBA = calculateDistanceMeters(-6.1754, 106.8272, -6.2088, 106.8456);

    expect(jarakAB).toBeCloseTo(jarakBA, 5);
  });

  it('menghitung jarak pendek dengan wajar (simulasi member sangat dekat dengan gym)', () => {
    // Selisih 0.0005 derajat lintang/bujur di sekitar khatulistiwa Indonesia
    // kira-kira setara 50-60 meter -- skenario realistis untuk validasi radius check-in.
    const gymLat = -6.2;
    const gymLon = 106.8;
    const jarak = calculateDistanceMeters(gymLat, gymLon, gymLat + 0.0005, gymLon);

    expect(jarak).toBeGreaterThan(0);
    expect(jarak).toBeLessThan(100);
  });
});