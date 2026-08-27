/**
 * Bottle scanner.
 *
 * Uses the device camera to read the barcode on her bottle and select that
 * product. On web the camera stream works in most browsers but barcode
 * decoding does not, so the screen says so rather than pretending.
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { BLButton } from '@/components/ui/button';
import { Card, ScreenHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { BLText } from '@/components/ui/text';
import { PRODUCTS, productById } from '@/constants/products';
import { color, radius, space, type } from '@/constants/theme';
import { hasBarcodeData, productForBarcode } from '@/lib/scan';
import { useDemo } from '@/lib/store';

const isWeb = Platform.OS === 'web';

export default function Scan() {
  const router = useRouter();
  const { pet, setPet } = useDemo();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onScanned = ({ data }: { data: string }) => {
    if (done) return;
    setDone(true);
    const id = productForBarcode(data);
    if (id) {
      setPet({ productId: id });
      router.back();
    } else {
      setResult(data);
    }
  };

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Scan your bottle" back />

      <View style={styles.body}>
        {isWeb ? (
          <Card style={styles.note}>
            <Icon name="camera" size={24} color={color.navy} />
            <BLText variant="label" style={styles.noteTitle}>
              Scanning needs the built app
            </BLText>
            <BLText variant="body" size={type.sm} tone="textMuted" style={styles.noteBody}>
              Browsers cannot reliably decode a barcode from a camera stream.
              On the installed app this points at the label and picks the right
              remedy for you.
            </BLText>
          </Card>
        ) : !permission?.granted ? (
          <Card style={styles.note}>
            <Icon name="camera" size={24} color={color.navy} />
            <BLText variant="label" style={styles.noteTitle}>
              Camera access
            </BLText>
            <BLText variant="body" size={type.sm} tone="textMuted" style={styles.noteBody}>
              We only use the camera to read the barcode on your bottle. The
              image never leaves your phone.
            </BLText>
            <BLButton label="Allow camera" onPress={requestPermission} style={styles.cta} />
          </Card>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'upc_a', 'upc_e', 'ean8', 'code128'],
              }}
              onBarcodeScanned={onScanned}
            />
            <View style={styles.reticle} />
          </View>
        )}

        {result ? (
          <Card style={styles.note}>
            <BLText variant="label" style={styles.noteTitle}>
              Not one we recognise
            </BLText>
            <BLText variant="body" size={type.sm} tone="textMuted" style={styles.noteBody}>
              Read {result}, which is not a BestLife4Pets code we have on file.
              Pick it by hand below.
            </BLText>
          </Card>
        ) : null}

        {!hasBarcodeData ? (
          <BLText variant="meta" size={12} tone="textFaint" style={styles.setupNote}>
            Setup note: the barcode table in lib/scan.ts is empty until the real
            GTINs are added from the bottles.
          </BLText>
        ) : null}

        {/* Always offer the manual path, so the screen is never a dead end. */}
        <BLText variant="eyebrow" style={styles.pickLabel}>
          Or pick it by hand
        </BLText>
        <View style={styles.picker}>
          {PRODUCTS.filter((p) => p.species.includes(pet.species)).map((p) => {
            const on = pet.productId === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  setPet({ productId: p.id });
                  router.back();
                }}
                style={[styles.row, on && styles.rowOn]}
              >
                <BLText variant="title" size={12} style={styles.rowText} numberOfLines={1}>
                  {p.shortName}
                </BLText>
                {on ? <Icon name="check" size={16} color={color.navy} /> : null}
              </Pressable>
            );
          })}
        </View>

        <BLText variant="meta" size={12} tone="textFaint" style={styles.current}>
          Currently set to {productById(pet.productId)?.shortName ?? '—'}.
        </BLText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  body: { flex: 1, padding: space.x5 },

  cameraWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: color.text,
  },
  camera: { flex: 1 },
  reticle: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: '28%',
    bottom: '28%',
    borderWidth: 3,
    borderColor: color.accent,
    borderRadius: radius.sm,
  },

  note: { alignItems: 'flex-start' },
  noteTitle: { marginTop: space.x3 },
  noteBody: { marginTop: space.x2 },
  cta: { marginTop: space.x4 },
  setupNote: { marginTop: space.x3, lineHeight: 17 },

  pickLabel: { marginTop: space.x6, marginBottom: space.x3 },
  picker: { gap: space.x2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.input,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: space.x4,
    paddingVertical: space.x3,
  },
  rowOn: { borderColor: color.accent },
  rowText: { flex: 1 },
  current: { marginTop: space.x4 },
});
