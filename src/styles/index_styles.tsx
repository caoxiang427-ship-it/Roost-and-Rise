import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'red',
        paddingBottom: 10,
    },
    profile: {
        backgroundColor: '#FFF',
        height: 60,
        width: 60,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: "center",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    headerBtns: {
        flexDirection: 'row',
    },
    volume: {
        marginRight: 10,
    },
    topDisplay: {
        
    },
});