import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { theme } from "./color";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos";
const TNW_KEY = "TNW";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [toDos, setToDos] = useState({});
  const [edit, setEdit] = useState({});
  const completed = false;
  useEffect(() => {
    loadToDos();
    loadTnW();
  }, []);
  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem(TNW_KEY, "false");
  };
  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem(TNW_KEY, "true");
  };
  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) setToDos(JSON.parse(s));
  };

  const loadTnW = async () => {
    const tnw = await AsyncStorage.getItem(TNW_KEY);
    tnw === "true" ? setWorking(true) : setWorking(false);
  };
  const addToDo = async () => {
    if (text === "") return;
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const editTextTrue = (key) => {
    setEdit((prev) => ({ ...prev, [key]: true }));
  };
  const editTextFalse = (key) => {
    setEdit((prev) => ({ ...prev, [key]: false }));
  };
  const editTextToDo = async (key) => {
    if (editText === "") return;
    const editedToDo = { ...toDos[key], text: editText };
    const newToDos = { ...toDos, [key]: editedToDo };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText("");
    editTextFalse(key);
  };
  const completedToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = newToDos[key].completed === true ? false : true;
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "sure",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Enjoy
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you edit to do?" : "Where do you edit to go?"
        }
        style={styles.input}
        hidden
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {edit[key] === true ? (
                <TextInput
                  onSubmitEditing={() => editTextToDo(key)}
                  onChangeText={onChangeEditText}
                  returnKeyType="done"
                  value={editText}
                  placeholder={
                    working
                      ? "What do you have to do?"
                      : "Where do you wnat to go?"
                  }
                  style={styles.input}
                  hidden
                />
              ) : (
                <Text
                  style={
                    toDos[key].completed === true
                      ? styles.toCompletedText
                      : styles.toDoText
                  }
                >
                  {toDos[key].text}
                </Text>
              )}

              <View style={styles.btnPos}>
                <TouchableOpacity
                  onPress={() => completedToDo(key)}
                  style={styles.eachBtn}
                >
                  {toDos[key].completed === true ? (
                    <Fontisto name="checkbox-active" size={24} color="black" />
                  ) : (
                    <Fontisto
                      name="checkbox-passive"
                      size={24}
                      color={theme.grey}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => editTextTrue(key)}
                  style={styles.eachBtn}
                >
                  <MaterialIcons name="edit" size={24} color={theme.grey} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={24} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  toCompletedText: {
    color: "grey",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "line-through",
  },
  btnPos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  eachBtn: {
    paddingRight: 10,
  },
});
