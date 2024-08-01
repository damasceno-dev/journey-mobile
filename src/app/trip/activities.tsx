import {Text, View} from "react-native";
import {TripData} from "@/app/trip/[id]";

type Props = {
    tripDetails: TripData;
}


export function Activities({tripDetails} : Props) {
    return <View className="flex-1"><Text className="text-white">{tripDetails.name}</Text></View>
}