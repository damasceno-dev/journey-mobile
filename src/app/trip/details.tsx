import {Alert, FlatList, Text, View} from "react-native";
import {useEffect, useState} from "react";
import {Link, linksServer} from "@/server/link-server";
import {Participant, participantsServer} from "@/server/participants-server";
import {Button} from "@/components/button";
import {colors} from "@/styles/colors";
import {Modal} from "@/components/modal";
import {Input} from "@/components/input";
import {validateInput} from "@/utils/validateInput";
import {TripLink} from "@/components/tripLink";
import {Edit2, Plus, Trash} from "lucide-react-native";

enum ModalEnum {
    NEW_LINK =0,
    EDIT_LINK=1,
    NONE=2,
}

export function Details({tripId} : {tripId:string}) {
    
    const [links, setLinks] = useState<Link[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    
    const [showLinkModal, setShowLinkModal] = useState(ModalEnum.NONE);
    
    const [linkTitle, setLinkTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkId, setLinkId] = useState("");
    
    const [isCreatingOrEditingLink, setIsCreatingOrEditingLink] = useState(false)
    async function getLinks() {
        try {
            const links = await linksServer.getByTripId(tripId);
            if (links) {
                setLinks(links);
            } else {
                Alert.alert("Links", "Erro ao carregar os links da viagem");
            }
        } catch (error) {
          throw error;
        } finally {
        
        }
    }
    
    async function getParticipants() {
        try {
          const participants = await participantsServer.getByTripId(tripId);
          if (participants) {
              setParticipants(participants);
          } else {
              Alert.alert("Participantes", "Erro ao carregar os participantes da viagem");
          }
        } catch (error) {
          throw error;
        } finally {
        
        }
    }

    async function handleCreateLink() {
        try {
            if (!linkTitle.trim()) {
                return Alert.alert("Link", "Informe um título para o link");
            }
            if (!validateInput.url(linkUrl.trim())) {
                return Alert.alert("Link", "Link inválido");
            }

            setIsCreatingOrEditingLink(true);

            await linksServer.create({tripId, title: linkTitle, url: linkUrl});
            Alert.alert("Link", "Link criado com sucesso!");
            setLinkTitle(""); setLinkUrl(""); setShowLinkModal(ModalEnum.NONE)
            await getLinks();
        } catch (error) {
            console.log(error)
            throw error;
        } finally {
            setIsCreatingOrEditingLink(false);
        }
    }

    function handleEditLink(id: string) {
        setShowLinkModal(ModalEnum.EDIT_LINK);
        const linkToEdit = links.find(l => l.id === id);
        if (!linkToEdit) {
            return Alert.alert("Link não encontrado", "O link a ser editado não está mais disponível");
        }
        setLinkTitle(linkToEdit.title); setLinkUrl(linkToEdit.url); setLinkId(id);
    }

    async function handleUpdateLink() {
        try {
            if (!linkTitle.trim()) {
                return Alert.alert("Link", "Informe um título para o link");
            }
            if (!validateInput.url(linkUrl.trim())) {
                return Alert.alert("Link", "Link inválido");
            }

            setIsCreatingOrEditingLink(true);

            await linksServer.update({tripId: tripId, id: linkId, title: linkTitle, url: linkUrl});
            Alert.alert("Link", "Link atualizado com sucesso!");
            setLinkTitle("");
            setLinkUrl("");
            setLinkId("");
            setShowLinkModal(ModalEnum.NONE);
            await getLinks();
        } catch (error) {
            console.log(error)
            throw error;
        } finally {

            setIsCreatingOrEditingLink(false);
        }
    }

    function confirmLinkDeletion() {
        return Alert.alert(
            "Deletar o link da viagem",
            `Tem certeza que quer deletar o link "${linkTitle}"?`,
            [
                {text: "Não",style: "cancel"},
                {text: "Sim",onPress: () => handleDeleteLink()}
            ]
        );
    }

    async function handleDeleteLink() {
        try {
            setIsCreatingOrEditingLink(true);

            await linksServer.deleteLink({tripId: tripId, id: linkId});
            Alert.alert("Link", "Link deletado com sucesso!");
            setLinkTitle("");
            setLinkUrl("");
            setLinkId("");
            await getLinks();
            setShowLinkModal(ModalEnum.NONE);
        } catch (error) {
            console.log(error)
            throw error;
        } finally {

            setIsCreatingOrEditingLink(false);
        }
    }
    
    useEffect(() => {
        getParticipants();
        getLinks();
    }, []);



    return (
        <View className="flex-1 mt-10">
            <Text className="text-zinc-50 text-2xl font-semibold mb-2">Links importantes:</Text>
            <View className="flex gap-10">
                {links.length > 0 ? (
                        <FlatList
                            data={links}
                            keyExtractor={item => item.id}
                            renderItem={({item}) => <TripLink data={item} handleEditLink={() => handleEditLink(item.id)}/>}
                        /> ) :
                        (
                         <Text className="text-zinc-50 font-sacramento text-3xl m-2 p-2">Não existem links cadastrados...</Text>
                        )}

                <Button variant="primary" onPress={() => setShowLinkModal(ModalEnum.NEW_LINK)}>
                    <Plus color={colors.zinc[200]} size={20}></Plus>
                    <Button.Title>Cadastrar novo link</Button.Title>
                </Button>
            </View>


            <Modal
                title="Cadastrar link"
                subtitle="Todos convidados podem visualizar os links importantes."
                visible={showLinkModal === ModalEnum.NEW_LINK}
                onClose={() => setShowLinkModal(ModalEnum.NONE)}
            >
                <View className="gap-2 mb-3">
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="Título do Link"
                            onChangeText={setLinkTitle}
                        />
                    </Input>
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="URL"
                            onChangeText={setLinkUrl}
                        />
                    </Input>
                </View>
                <Button isLoading={isCreatingOrEditingLink} onPress={handleCreateLink}>
                    <Button.Title>Salvar link</Button.Title>
                </Button>
            </Modal>

            <Modal
                title="Editar link"
                subtitle="Edite ou apague o link dessa viagem"
                visible={showLinkModal === ModalEnum.EDIT_LINK}
                onClose={() => {
                    setShowLinkModal(ModalEnum.NONE);
                    setLinkId("");
                }}
            >
                <View className="gap-2 mb-3">
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="Título do Link"
                            onChangeText={setLinkTitle}
                            value={linkTitle}
                        />
                    </Input>
                    <Input variant="secondary">
                        <Input.Field
                            placeholder="URL"
                            onChangeText={setLinkUrl}
                            value={linkUrl}
                        />
                    </Input>
                </View>
                <View className="gap-2 mb-3">
                    <Button isLoading={isCreatingOrEditingLink} onPress={handleUpdateLink}>
                        <Edit2 color={colors.zinc[950]} size={20}></Edit2>
                        <Button.Title>Salvar edição</Button.Title>
                    </Button>
                    <Button variant="delete" isLoading={isCreatingOrEditingLink} onPress={confirmLinkDeletion}>
                        <Trash color={colors.zinc[950]} size={20}></Trash>
                        <Button.Title>Deletar link</Button.Title>
                    </Button>
                </View>
            </Modal>
            
        </View>
    )
}