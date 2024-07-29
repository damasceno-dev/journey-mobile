import {Image, Text, View} from "react-native";
import React from "react";
import {Input} from "@/components/input";

export default function Index() {
    return (
        <View className="flex-1 items-center justify-center">
            <Image source={require("@/assets/logo.png")} className="h-8" resizeMode="contain"/>
            <Text className="text-zinc-400 font-sacramento text-center text-4xl mt-1 py-2">Convide seus amigos e planeje a {"\n"}próxima viagem</Text>
            
            <View>
                <Input>
                    <Input.Field placeholder="ain jackson"  ></Input.Field>
                </Input>
            </View>
            
        </View>
    )
}

