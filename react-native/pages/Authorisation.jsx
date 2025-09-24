import React from 'react'
import { View, Text, StatusBar } from 'react-native'
import { Leaf } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabNavigation from '../navigation/TabNavigation';

const Authorisation = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F2FCE2' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#F2FCE2" />
            <View style={{ flex: 1 }}>
                <View style={{ flex: 0.08, flexDirection: 'row', marginLeft: 20  }}>
                    <Leaf color="green" size={48} style={{ fontSize: 24, alignSelf: 'center' }} />
                    <Text style={{ fontSize: 24, alignSelf: 'center' }}>ANNADATA</Text>
                </View>
                <View style={{ flex: 0.07, flexDirection: 'row', marginLeft: 20  }}><Text style={{ fontSize: 36, alignSelf: 'center' }}>Get Started Now</Text></View>
                <View style={{ flex: 0.05, marginLeft: 20 }}><Text style={{ fontSize: 14 }}>Create an account or log in to explore about our app</Text></View>
                <View style={{ flex: 0.8, borderTopRightRadius: 20, borderTopLeftRadius: 20, backgroundColor: 'white', marginTop: 20, padding: 25}}>
                    <TabNavigation />
                </View>
            </View>

        </SafeAreaView>
    )
}

export default Authorisation