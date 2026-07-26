import { Modal, View, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage, InputToolbar } from 'react-native-gifted-chat'
import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '@/store/useProfileStore';
import { supabase } from '@/lib/supabase';
import { Ionicons } from "@expo/vector-icons";



type AiChatModalProps = {
  visible: boolean;
  setVisibility: (visibility: boolean) => void;
};

const AiChatModal = (props: AiChatModalProps) => {

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const chickName = useProfileStore((state) => state.chickName);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    useEffect(() => {
        setMessages([
        {
            _id: 1,
            text: `Hello! I'm ${chickName}, your virtual friend! I'm here 24/7 so talk to me about whatever. 😊`,
            createdAt: new Date(),
            user: {
            _id: 2,
            name: chickName,
            avatar: require('../../../assets/images/planner/chicken_profile_pic.png'),
            
            },
            quickReplies: {
                type: 'radio',           // 'radio' = pick one
                keepIt: false,           // buttons don't stay visible after a reply is picked
                values: [
                { title: "How do I use this app?", value: 'app_function' },
                { title: "I want to talk about my day!", value: 'talk' },
                { title: 'I need someone to talk to ❤️', value: 'mental_health' },
                ],
            },
        },
        ])
    }, [])

    const onSend = useCallback(async (newMessages: IMessage[] = []) => {
        const updated = GiftedChat.append(messages, newMessages);
        setMessages(updated);
        // waiting for ai response -> set typing = true to show the typing indicator in gifted chat
        setIsTyping(true);

        // convert chat history into Gemini's expected format
        // GiftedChat stores newest-first — reverse for Gemini, which wants oldest first
        const history = [...updated]
            .filter(m => m._id !== 1) // filter out very first greeting message
            .reverse()
            .map(m => ({
                role: m.user._id === 1 ? 'user' : 'model',
                text: m.text,
            }));

        // call edge function and pass messages into gemini
        const { data, error } = await supabase.functions.invoke('ask-ai', {
            body: { messages: history, chickName: chickName, today: today, mode: 'companion' },
        });

        // after receiving a response, set typing = false to turn off the typing indicator
        setIsTyping(false);
        setMessages(prev => GiftedChat.append(prev, [{
            _id: Math.random().toString(),
            text: error ? 'Something went wrong, try again.' : data.reply,
            createdAt: new Date(),
            user: { _id: 2, name: chickName, avatar: require('../../../assets/images/planner/chicken_profile_pic.png') },
        }]));
        }, [messages]);

  return (
    <Modal 
       visible={props.visible} 
       transparent={true} 
       animationType="fade" 
       onRequestClose={() => props.setVisibility(false)} // for android (upopn pressing android back button, modal will close)
    >
        <View style={styles.backdrop}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={styles.chatContainer}
            >
                <TouchableOpacity onPress={() => props.setVisibility(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#000000"/>
                </TouchableOpacity>
                <GiftedChat
                    messages={messages}
                    isTyping={isTyping}
                    onSend={messages => onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                    quickReplyStyle={{ backgroundColor: '#538de4', borderRadius: 20, width: '80%', }}
                    quickReplyTextStyle={{color: '#FFF', fontFamily: 'InterRegular',}}
                    onQuickReply={(replies) => {
                        // replies is an array — one item for radio, possibly several for checkbox
                        const reply = replies[0];

                        // build a message representing the user's tap, same as if they'd typed it
                        const userMessage: IMessage = {
                        _id: Math.random().toString(),
                        text: reply.title,
                        createdAt: new Date(),
                        user: { _id: 1 },
                        };

                        setMessages(prev => GiftedChat.append(prev, [userMessage]));
                        onSend([userMessage]);
                    }}
                    renderInputToolbar={(props) => (
                        <InputToolbar
                            {...props}
                            containerStyle={{
                                borderRadius: 10,
                            }}
                        />
                    )}
                />
            </KeyboardAvoidingView>
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
    width: '100%',
    padding: 20
  },
  closeBtn: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 10,
    alignSelf: 'flex-start'
  },
});

export default AiChatModal;