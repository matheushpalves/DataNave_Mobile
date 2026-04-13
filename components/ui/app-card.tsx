import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type AppCardProps = {
  children: ReactNode;
};

function AppCardComponent({ children }: AppCardProps) {
  return <View style={styles.card}>{children}</View>;
}

export const AppCard = memo(AppCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
