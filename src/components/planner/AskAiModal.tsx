import { Modal, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { useState, useEffect, useCallback } from 'react';


type AskAiModalProps = {
  visible: boolean;
  setVisibility: (visibility: boolean) => void;
};

const AskAiModal = (props: AskAiModalProps) => {
    const [messages, setMessages] = useState<IMessage[]>([]);

    useEffect(() => {
        setMessages([
        {
            _id: 1,
            text: 'Hello developer',
            createdAt: new Date(),
            user: {
            _id: 2,
            name: 'John Doe',
            avatar: 'https://placeimg.com/140/140/any',
            },
        },
        ])
    }, [])

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        setMessages(previousMessages =>
            GiftedChat.append(previousMessages, newMessages),
        );
    }, []);

  return (
    <Modal 
       visible={props.visible} 
       transparent={true} 
       animationType="fade" 
       onRequestClose={() => props.setVisibility(false)} // for android (upopn pressing android back button, modal will close)
    >
      <View style={styles.backdrop}>
        <View style={styles.chatContainer}>
            <TouchableOpacity onPress={() => props.setVisibility(false)} style={styles.closeBtn}>
                <Text>Close</Text>
            </TouchableOpacity>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: 1,
                }}
            />
            </View>
        </View>
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
  chatContainer: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%', // adjust as needed
    width: '80%',
    padding: 20
  },
  closeBtn: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignSelf: 'flex-start'
  },
});

export default AskAiModal;