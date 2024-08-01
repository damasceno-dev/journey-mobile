import {Alert, TouchableOpacity, View} from "react-native";
import {router, useLocalSearchParams} from "expo-router";
import {useEffect, useState} from "react";
import {TripDetails, tripServer} from "@/server/trip-server";
import Loading from "@/components/loading";
import {Input} from "@/components/input";
import {CalendarRange, Info, MapPin, Settings2} from "lucide-react-native";
import {colors} from "@/styles/colors";
import dayjs from "dayjs";
import {calendarUtils} from "@/utils/calendarUtils";
import {Button} from "@/components/button";
import {Activities} from "@/app/trip/activities";
import {Details} from "@/app/trip/details";

export type TripData = TripDetails & {
    when: string;
}

export default function Trip() {
    
    const [isLoadingTrip, setIsLoadingTrip] = useState(true);
    const [tripDetails, setTripDetails] = useState<TripData>({} as TripData)
    const [option, setOption] = useState<"activity" | "details">("activity")
    
    const {id} = useLocalSearchParams<{id: string}>();
    const tripId = id;
    
    async function getTripDetails() {
      try {
        setIsLoadingTrip(true);
        if (!tripId) {
            Alert.alert("Viagem não encontrada", "O id da viagem não foi encontrado, voltando para página anterior...");
            return router.back();
        }
        
        const trip = await tripServer.getById(tripId);
        const maxLengthDestination = 14
        const destination = trip.name.length > maxLengthDestination ? trip.name.slice(0, maxLengthDestination) + "..." : trip.name;
        
        setTripDetails({
            ...trip, 
            when: `${destination} de ${calendarUtils.formatDatesInText({startsAt: dayjs(trip.startDate),  endsAt: dayjs(trip.endDate)})}`
        })
        
      } catch (error) {
          console.log(error)
        throw error;
      } finally {
        setIsLoadingTrip(false);
      }
    }
    
    useEffect(() => {
        getTripDetails();
    }, [])
    
    if(isLoadingTrip) {
        return <Loading/>
    }
    
    return (
        <View className="flex-1 px-5 pt-16">
            <Input variant="tertiary">
                <MapPin color={colors.zinc[400]} size={20}/>
                <Input.Field value={tripDetails.when}></Input.Field>
                <TouchableOpacity activeOpacity={0.6} className="w-9 h-9 bg-zinc-800 items-center justify-center rounded">
                    <Settings2 color={colors.zinc[400]} size={20}/>
                </TouchableOpacity>
            </Input>

            {option === "activity" ? (
                <Activities tripDetails={tripDetails}/>
            ) : (
                <Details tripId={tripDetails.id}/>
            )}
            
            <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc950">
                <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
                    <Button
                        className="flex-1"
                        onPress={() => setOption("activity")}
                        variant={option === "activity" ? "primary" : "secondary"}
                    >
                        <CalendarRange color={option === "activity" ? colors.lime[950] : colors.zinc[200]}/>
                        <Button.Title>Atividades</Button.Title>
                    </Button>
                    <Button
                        className="flex-1"
                        onPress={() => setOption("details")}
                        variant={option === "details" ? "primary" : "secondary"}
                    >
                        <Info color={option === "details" ? colors.lime[950] : colors.zinc[200]}/>
                        <Button.Title>Detalhes</Button.Title>
                    </Button>
                </View>
            </View>
        </View>
    )
}