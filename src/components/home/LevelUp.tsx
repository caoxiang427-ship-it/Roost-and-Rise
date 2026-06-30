import { Modal, View, TouchableOpacity, StyleSheet, ImageBackground, Text, Image } from 'react-native';

type LevelUpProps = {
  visible: boolean;
  onClose: () => void;
  level: number;
  coinsEarned: number
};

const LevelUp = (props: LevelUpProps) => {
  return (
    <Modal visible={props.visible} transparent animationType="fade">
      <TouchableOpacity 
        style={styles.backdrop}
        onPress={props.onClose} 
        activeOpacity={1} 
      >
        <TouchableOpacity activeOpacity={1} style={styles.box}>
              <ImageBackground
                    source={require("../../../assets/images/home/levelup_background.png")}
                    style={styles.image}>
                      <Text style={styles.levelTxt}>LEVEL</Text>
                      <Text style={styles.level}>{props.level}</Text>
              </ImageBackground>
              
              <Text style={styles.title}>Congratulations!</Text>
              <Text style={styles.subtitle}>Keep going forward :)</Text>
              <View style={styles.coin}>
                <Image
                source={require('../../../assets/images/home/coin.png')}
                style={{width: 28, height: 30, marginHorizontal: 3,}}
                ></Image>
                <Text style={styles.coinAmt}>{props.coinsEarned}</Text>
              </View>
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
  },
  image: {
    height: 140,
    width: 260,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  levelTxt: {
    fontFamily: "InterBold",
    fontSize: 30,
    color: '#FFF',
  },
  level: {
    fontFamily: 'InterBold',
    fontSize: 70,
    color: '#FCFFD7',
  },
  title: {
    fontFamily: 'InterBold',
    fontSize: 20,
    color: '#5371AE',
    paddingTop: 5,
  },
  subtitle: {
    fontFamily: 'InterBold',
    fontSize: 16,
    color: '#5371AE',
    paddingBottom: 5,
  },
  coin: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  coinAmt: {
    fontFamily: 'InterBold',
    fontSize: 24,
    color: '#243F6E'
  },

});

export default LevelUp;