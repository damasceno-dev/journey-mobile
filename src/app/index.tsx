import {Alert, Image, Keyboard, Text, View} from "react-native";
import React, {useState} from "react";
import {Input} from "@/components/input";
import {
    ArrowRight,
    AtSign,
    Calendar as IconCalendar,
    MapPin,
    Plus,
    Settings2,
    UserRoundPlus
} from "lucide-react-native";
import {colors} from "@/styles/colors";
import {Button} from "@/components/button";
import {Modal} from "@/components/modal";
import {Calendar} from "@/components/calendar";
import {calendarUtils, DatesSelected} from "@/utils/calendarUtils";
import {DateData} from "react-native-calendars";
import dayjs from "dayjs";
import {GuestData} from "@/components/email";
import {validateInput} from "@/utils/validateInput";

enum StepForm {
    TRIP_DETAILS = 1,
    ADD_EMAIL = 2,
}

enum ModalEnum {
    NONE = 0,
    CALENDAR = 1,
    GUESTS = 2
}

type GuestsToInvite = {
    name: string;
    email: string;
};

export default function Index() {
    
    const [stepForm, setStepForm] = useState(StepForm.TRIP_DETAILS);
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected)
    const [showModal, setShowModal] = useState(ModalEnum.NONE);
    const [destination, setDestination] = useState("");
    
    const [guestsToInvite, setGuestsToInvite] = useState<GuestsToInvite[]>([])
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    function handleNextStepForm() {
        if (destination.trim().length === 0 || !selectedDates.startsAt || !selectedDates.endsAt) {
            return Alert.alert("Detalhes da viagem", "Preencha todas informações da viagem para prosseguir.")
        }
        
        if (stepForm === StepForm.TRIP_DETAILS) {
            return setStepForm(StepForm.ADD_EMAIL);
        }
    }
    
    function handleSelectedDate(selectedDay: DateData) {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDates.startsAt,
            endsAt: selectedDates.endsAt,
            selectedDay
        })
        setSelectedDates(dates);
    }
    
    function handleGuestToRemove(guestToRemoveEmail: string) {
        setGuestsToInvite(prevState => prevState.filter(g => g.email!== guestToRemoveEmail));
    }
    
    function handleGuestToAdd({guestName, guestEmail} : {guestName: string,  guestEmail: string}) {
        if (guestName.trim() === "" || guestEmail.trim()==="") {
            return;
        }
        if (!validateInput.email(guestEmail)) {
            return Alert.alert("Convidado", "E-mail inválido")
        }
        if (guestsToInvite.find(g => g.email.trim() === guestEmail.trim())) {
            return Alert.alert("Convidado", "Esse e-mail já foi adicionado")
        }
        
        
        setGuestsToInvite(prevState => [...prevState, {name: guestName,  email: guestEmail}])
        setGuestName(""); setGuestEmail("");
    }
    
    function handleGuestsText() {
        if (guestsToInvite.length === 1) {
            return "1 pessoa convidada"
        } else if (guestsToInvite.length > 1) {
            return `${guestsToInvite.length} pessoas convidadas`
        } else {
            return ""
        }
    }
    
    return (
        <View className="flex-1 items-center justify-center">
            <Image source={require("@/assets/logo.png")} className="h-8" resizeMode="contain"/>
            <Image source={require("@/assets/bg.png")} className="absolute" resizeMode="contain"/>
            <Text className="text-zinc-400 font-sacramento text-center text-4xl mt-1 py-2">Convide seus amigos e planeje a {"\n"}próxima viagem</Text>
            
            <View className="w-full bg-zinc-900 p-4 rounded-xl my-8 border border-zinc-800">
                <Input>
                    <MapPin color={colors.zinc[400]} size={20}/>
                    <Input.Field
                        placeholder="Para onde?"
                        editable={stepForm === StepForm.TRIP_DETAILS}
                        onChangeText={setDestination}
                        value={destination}
                    ></Input.Field>
                </Input>
                <Input>
                    <IconCalendar color={colors.zinc[400]} size={20}/>
                    <Input.Field 
                        placeholder="Quando?"  
                        editable={stepForm===StepForm.TRIP_DETAILS}
                        onFocus={() => Keyboard.dismiss()}
                        showSoftInputOnFocus={false}
                        onPress={() => stepForm === StepForm.TRIP_DETAILS && setShowModal(ModalEnum.CALENDAR)}
                        value={selectedDates.formatDatesInText}
                    ></Input.Field>
                </Input>

                {stepForm === StepForm.ADD_EMAIL && (
                   <>
                        <View className="border-b py-3 border-zinc-800">
                            <Button variant="secondary" onPress={() => setStepForm(StepForm.TRIP_DETAILS)}>
                                <Button.Title>Alterar local/data</Button.Title>
                                <Settings2 color={colors.zinc[200]} size={20}/>
                            </Button>
                        </View>
                        
                        <Input>
                            <UserRoundPlus color={colors.zinc[400]} size={20}/>
                            <Input.Field
                                placeholder="Quem estará na viagem?"
                                autoCorrect={false}
                                value={handleGuestsText()}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    setShowModal(ModalEnum.GUESTS);
                                }}
                                showSoftInputOnFocus={false}
                            ></Input.Field>
                        </Input>
                   </> 
                )}
                <Button onPress={handleNextStepForm}>
                    <Button.Title>{stepForm=== StepForm.TRIP_DETAILS ? "Continuar" : "Confirmar viagem"}</Button.Title>
                    <ArrowRight color={colors.lime[950]} size={20}/>
                </Button>
            </View>
            
            <Text className="text-zinc-500 font-regular text-center text-base">Ao planejar sua viagem pela plann.er, você automaticamente concorda com nossos <Text className="text-zinc-300 underline">termos de uso e políticas de privacidade.</Text></Text>
            
            <Modal 
                title="Selecionar datas" 
                subtitle="Selecione as datas de ida e volta da viagem" 
                visible={showModal === ModalEnum.CALENDAR}
                onClose={() => {setShowModal(ModalEnum.NONE)}}
            >
                <View className="gap-4 mt-4">
                    <Calendar
                        onDayPress={handleSelectedDate}
                        markedDates={selectedDates.dates}
                        minDate={dayjs().toISOString()}
                    />
                    <Button onPress={() => setShowModal(ModalEnum.NONE)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>

            <Modal
                title="Selecionar convidados"
                subtitle="Os convidados irão receber e-mails para confirmar a participação na viagem"
                visible={showModal === ModalEnum.GUESTS}
                onClose={() => setShowModal(ModalEnum.NONE)}
            >
                <View className="my-2 bg-zinc-800 rounded-xl flex flex-row flex-wrap gap-1.5 border-b border-zinc-500 p-5">

                    {guestsToInvite.length > 0 ? (
                        guestsToInvite.map(g => (
                            <GuestData key={g.email} name={g.name} email={g.email} onRemove={() => handleGuestToRemove(g.email)}/>
                        ))
                        
                    ) :(
                        <Text className="text-zinc-600 text-base font-regular">Nenhum convidado ainda...</Text>
                    )}
                </View>
                <View className="gap-4 mt-4">
                    <Input variant="secondary">
                        <UserRoundPlus color={colors.zinc[400]} size={20}></UserRoundPlus>
                        <Input.Field
                            placeholder="Digite o nome do convidado"
                            keyboardType="email-address"
                            onChangeText={setGuestName}
                            value={guestName}
                            autoCorrect={false}
                        ></Input.Field>
                    </Input>
                    <Input variant="secondary">
                        <AtSign color={colors.zinc[400]} size={20}></AtSign>
                        <Input.Field
                            placeholder="Digite o email do convidado"
                            keyboardType="email-address"
                            onChangeText={(text) => setGuestEmail(text.toLowerCase())}
                            value={guestEmail}
                            autoCorrect={false}
                        ></Input.Field>
                    </Input>
                    <Button onPress={() => handleGuestToAdd({guestName, guestEmail})} variant="secondary">
                        <Button.Title>Adicionar</Button.Title>
                        <Plus color={colors.zinc[400]} size={20}></Plus>
                    </Button>
                    <Button onPress={() => setShowModal(ModalEnum.NONE)}>
                        <Button.Title>Continuar</Button.Title>
                        <ArrowRight color="black" size={20}></ArrowRight>
                    </Button>
                </View>
            </Modal>
            
        </View>
    )
}

