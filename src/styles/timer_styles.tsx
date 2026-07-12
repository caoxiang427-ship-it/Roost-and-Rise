import { StyleSheet, Platform } from 'react-native';

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

  // Hero: chicken + summary
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroChickenCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSummaryCol: {
    flex: 1,
    gap: 10,
  },
  portraitChicken: {
    width: 150,
    height: 160,
  },
  message: {
    textAlign: 'center',
    fontSize: 13,
    color: '#5E9A8B',
    marginBottom: 18,
  },

  // Summary tiles
  tile: {
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

  // Duration steppers
  controlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  controlCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  controlLabel: {
    fontSize: 12,
    color: '#6F8A85',
    marginBottom: 9,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  // XP reward card
  xpCard: {
    backgroundColor: '#E7EFF4',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  xpHeaderText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2E5A72',
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  xpLabel: {
    fontSize: 12,
    color: '#5E7E90',
  },
  xpValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3D7391',
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
