import { Modal, View, TouchableOpacity, StyleSheet, Text } from 'react-native';

type InfoModalProps = {
  visible: boolean;
  onClose: () => void;
  type: 'xp' | 'workload';
};

const InfoModal = (props: InfoModalProps) => {
  return (
    <Modal visible={props.visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.backdrop}
        onPress={props.onClose} 
        activeOpacity={1} 
      >
        <TouchableOpacity activeOpacity={1} style={styles.box}>
            {props.type === 'xp' &&
            <View style={{paddingVertical: 10, paddingHorizontal: 15}}>
              <View style={{paddingBottom: 10}}>
                <Text style={styles.title}>About the XP System</Text>
                <Text style={styles.subtitle}>In Roost&Rise, XP is awarded based on the 3 pillars as follows</Text>
              </View>

              <View style={{paddingLeft: 40}}>
                <Text style={styles.bullet}>• Focus 🎧</Text>
                <Text style={{fontFamily: 'InterSemiBold', color: '#66A5B9', fontSize: 13}}>Centers around the pomodoro timer </Text>
                <Text style={[styles.contents]}>
                  - 1 minute of work: 1 xp {'\n'}
                  - 1 minute of rest: 0.5 xp {'\n'}
                </Text>

                <Text style={styles.bullet}>• Progress ⏳</Text>
                <Text style={{fontFamily: 'InterSemiBold', color: '#66A5B9', fontSize: 13}}>Centers around the todo list </Text>
                <Text style={styles.contents}>
                  - 1 easy task: 5 xp {'\n'}
                  - 1 moderate task: 10 xp {'\n'}
                  - 1 hard task: 15 xp {'\n'}
                </Text>

                <Text style={styles.bullet}>• Wellbeing ❤️</Text>
                <Text style={{fontFamily: 'InterSemiBold', color: '#66A5B9', fontSize: 13}}>Centers around the self care tab </Text>
                <Text style={styles.contents}>
                  - Daily mood log: 15 xp {'\n'}
                  - 1 self care log: 5 xp {'\n'}
                </Text>
              </View>

              <Text style={{fontFamily: 'InterSemiBold', color: '#66A5B9'}}>Note that only focus and progress pillars have daily XP caps!</Text>

            </View>
            }

            {props.type === "workload" &&
              <View style={{paddingVertical: 10, paddingHorizontal: 15}}>
                <View style={{paddingBottom: 10}}>
                <Text style={styles.title}>About the Daily Workload Score</Text>
                <Text style={styles.subtitle}> Our todo list incorporates a hidden workload score mechanic.
                  Each task will be allocated a workload score based on it's difficulty.
                  If the total workload score exceeds a preset threshold, a warning will be given.
                </Text>

                <View style={{paddingTop: 20, paddingLeft: 40}}>
                  <Text style={styles.bullet}>• Workload score</Text>
                  <Text style={{fontFamily: 'InterSemiBold', color: '#66A5B9', fontSize: 13}}>Centers around the todo list </Text>
                  <Text style={styles.contents}>
                    - 1 easy task: 1 {'\n'}
                    - 1 moderate task: 2 {'\n'}
                    - 1 hard task: 3 {'\n'}
                  </Text>
                </View>
              </View>
                
              </View>
            }
              
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    marginHorizontal: 30,
  },
  title: {
    fontFamily: 'InterBold',
    color: '#025673',
    fontSize: 17,
  },
  subtitle: {
    fontFamily: 'InterSemiBold',
    color: '#8a8a8a',
    fontSize: 13,
  },
  bullet: {
    fontFamily: "InterBold",
    color: '#025673',
    fontSize: 15
  },
  contents: {
    fontFamily: "InterRegular",
    fontSize: 12,
    color: '#383838'
  }
  
});

export default InfoModal;