import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E9F1ED',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  headerBand: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 16,
    minHeight: 96,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  headerImage: {
    borderRadius: 20,
    opacity: 0.7,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233,241,237,0.15)',
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
    color: '#22403B',
    marginBottom: 4,
  },
  date: {
    fontSize: 15,
    color: '#3C6B5C',
    marginTop: 2,
  },

  // Chicken companion
  companionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  companionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companionName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#22403B',
  },
  companionLevel: {
    fontSize: 12,
    color: '#6F8A85',
    marginTop: 1,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FBF0D0',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  readyPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A6791E',
  },
  speechBubble: {
    alignSelf: 'center',
    backgroundColor: '#EAF3EE',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 10,
    maxWidth: '85%',
  },
  speechText: {
    fontSize: 13,
    color: '#3E7264',
    textAlign: 'center',
  },
  speechTail: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#EAF3EE',
    transform: [{ rotate: '45deg' }],
  },
  companionArtWrap: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  companionArt: {
    width: 160,
    height: 160,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelLabel: {
    fontSize: 15,
    color: '#6F8A85',
  },
  levelValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#C79A24',
  },
  levelTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E4EDE8',
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    backgroundColor: '#F5C13D',
    borderRadius: 999,
  },
  
  // 3-tab card
  tabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F7F4',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    color: '#6F8A85',
  },
  tabTextActive: {
    color: '#2F6E60',
    fontWeight: '500',
  },
  tabBody: {
    padding: 10,
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 13,
    color: '#6F8A85',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#EEF3F0',
    marginVertical: 4,
  },

  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22403B',
  },
  taskCount: {
    fontSize: 12,
    color: '#6F8A85',
  },
  taskProgressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E4EDE8',
    overflow: 'hidden',
    marginBottom: 14,
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: '#4E9A87',
    borderRadius: 999,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: '#E1EAE5',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginBottom: 8,
  },
  taskCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C9D8D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCircleDone: {
    backgroundColor: '#4E9A87',
    borderColor: '#4E9A87',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: '#22403B',
  },
  taskTextDone: {
    color: '#9CB0A8',
    textDecorationLine: 'line-through',
  },
  taskEmpty: {
    fontSize: 13,
    color: '#9CB0A8',
    textAlign: 'center',
    paddingVertical: 8,
  },
  taskHint: {
    fontSize: 12,
    color: '#9CB0A8',
    textAlign: 'center',
    marginTop: 8,
  },

  // Summary tiles
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIconGreen: {
    backgroundColor: '#D8ECE4',
  },
  tileIconBlue: {
    backgroundColor: '#D9E7EF',
  },
  tileNumber: {
    fontSize: 19,
    fontWeight: '500',
    color: '#22403B',
  },
  tileLabel: {
    fontSize: 11,
    color: '#6F8A85',
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnGreen: {
    backgroundColor: '#EAF2EE',
  },
  stepBtnBlue: {
    backgroundColor: '#E6EFF4',
  },
  stepValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22403B',
    minWidth: 52,
    textAlign: 'center',
  },

  // Circular timer
  ringWrap: {
    width: 210,
    height: 210,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMode: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
  },
  ringTime: {
    fontSize: 48,
    fontWeight: '500',
    color: '#22403B',
    marginTop: 4,
  },

  // Cycle position + dots
  cycleWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 13,
    color: '#5E9A8B',
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#4E9A87',
  },
  dotInactive: {
    backgroundColor: '#CBDDD5',
  },

  // Controls
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  primaryBtn: {
    flex: 1.3,
    backgroundColor: '#2F6E60',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E4DD',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#5C8379',
    fontSize: 14,
    fontWeight: '500',
  },

  // Quote card
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F4F1E8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
  },
  quoteIcon: {
    marginTop: 2,
  },
  quoteText: {
    fontSize: 13,
    color: '#5A6B4E',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#8A9B7E',
    marginTop: 4,
  },

  // Completion modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(34,64,59,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
  },
  modalBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#22403B',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalFeedback: {
    fontSize: 13,
    color: '#6F8A85',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalStrong: {
    color: '#22403B',
    fontWeight: '500',
  },
  xpPill: {
    backgroundColor: '#F7E9E4',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  xpPillText: {
    color: '#BE6252',
    fontSize: 12,
    fontWeight: '500',
  },
  modalMessage: {
    fontSize: 14,
    color: '#22403B',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalAccent: {
    color: '#2F7264',
    fontWeight: '500',
  },
  modalPrimary: {
    width: '100%',
    backgroundColor: '#2F6E60',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  modalSecondary: {
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#5C8379',
    fontSize: 14,
    fontWeight: '500',
  },
  modalStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  modalStepperValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#22403B',
    minWidth: 64,
    textAlign: 'center',
  },
});
