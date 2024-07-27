import '@/styles/global.css'

import {Slot} from "expo-router";
import {View} from "react-native";
export default function Layout() {
    return (
        <View className="flex-1 bg-zinc-950">
            <Slot/>
        </View>
    )
}