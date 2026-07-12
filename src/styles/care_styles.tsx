import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F4EC',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },

  // Header
  headerBand: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 16,
    minHeight: 96,
    justifyContent: 'flex-end',
  },
  headerImage: {
    borderRadius: 20,
    opacity: 0.7,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(241,244,236,0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerEditBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 30,
    fontWeight: 'bold',
    color: '#3C463A',
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: '#5E6E55',
    marginTop: 2,
  },

  // BurnoutIndicator
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7ECE1',
    shadowColor: '#3C463A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  // Mood card
  moodCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E7ECE1',
    shadowColor: '#3C463A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moodQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3C463A',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
  },
  moodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E6ECE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircleActive: {
    backgroundColor: '#8FB07A',
    borderWidth: 3,
    borderColor: '#D6E3CC',
  },
  moodEmoji: {
    fontSize: 30,
  },

  // Section title
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3C463A',
    marginTop: 2,
    marginBottom: -4,
  },

  // Category grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  careTile: {
    width: '31%',
    minHeight: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7ECE1',
    shadowColor: '#3C463A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  careTileActive: {
    borderColor: '#8FB07A',
    borderWidth: 1.5,
    backgroundColor: '#EDF2E8',
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C463A',
    textAlign: 'center',
  },
  tileCount: {
    fontSize: 11,
    color: '#7C9A66',
    fontWeight: '600',
    marginTop: 2,
  },

  // Manage tile
  addTile: {
    width: '31%',
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C4CDBA',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPlus: {
    fontSize: 22,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E7D67',
  },

  // Log modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44,42,38,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E7ECE1',
    shadowColor: '#3C463A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#3C463A',
  },
  input: {
    backgroundColor: '#F4F6F1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#3C463A',
    borderWidth: 1,
    borderColor: '#DCE4D5',
  },
  logActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#EEF1EA',
  },
  cancelButtonText: {
    color: '#6E7D67',
    fontSize: 16,
    fontWeight: '600',
  },
  logButton: {
    flex: 1,
    backgroundColor: '#8FB07A',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Today's log
  logList: {
    gap: 10,
  },
  logRow: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7ECE1',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  logMain: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3C463A',
  },
  logSub: {
    fontSize: 12,
    color: '#93A089',
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    color: '#A6B49E',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  logCount: {
    fontSize: 13,
    color: '#5E6E55',
    fontWeight: '600',
  },
  toastWrap: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});
