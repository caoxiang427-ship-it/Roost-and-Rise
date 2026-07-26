import { Modal, View, TouchableOpacity, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat'
import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '@/store/useProfileStore';
import { } from 'react-native-gifted-chat';
import { supabase } from '@/lib/supabase';


type AskAiModalProps = {
  visible: boolean;
  setVisibility: (visibility: boolean) => void;
};

const AskAiModal = (props: AskAiModalProps) => {

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const chickName = useProfileStore((state) => state.chickName);

    useEffect(() => {
        setMessages([
        {
            _id: 1,
            text: `Hello! I'm ${chickName}. Even though I'm just a chicken, I'm here to assist you in any way I can. Ask away! ❤️`,
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
                { title: "Help me plan my schedule for today!", value: 'today_schedule' },
                { title: "What's my schedule like for today?", value: 'today_schedule' },
                { title: 'How do I use this study planner?', value: 'planner_guide' },
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
            body: { messages: history, chickName: chickName, },
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
                    <Text>Close</Text>
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
    borderRadius: 10,
    padding: 10,
    alignSelf: 'flex-start'
  },
});

export default AskAiModal;