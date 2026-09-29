import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { HeaderButton, HeaderButtons, Item } from 'react-navigation-header-buttons';
import colors from '../utils/colors';
import supportedLanguages from '../utils/supportedLanguages';
import LanguageItem from '../components/LanguageItem';

const CustomHeaderButton = props => {
    return <HeaderButton
                {...props}
                IconComponent={Ionicons}
                iconSize={23}
                color={props.color || colors.primary}
            />
}

export default function LanguageSelectScreen({ navigation, route }) {
    const params = route.params || {};
    const { title, selected, onSelect } = params;

    useEffect(() => {
        navigation.setOptions({
            headerTitle: title,
            headerRight: () => (
                <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
                    <Item
                        iconName="close"
                        color={colors.textColor}
                        onPress={() => navigation.goBack()}
                    />
                </HeaderButtons>
            )
        });
    }, [navigation, title]);

    const handleLanguageSelect = (itemKey) => {
        if (onSelect) {
            onSelect(itemKey);
        }
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={Object.keys(supportedLanguages)}
                keyExtractor={(item) => item}
                renderItem={(itemData) => {
                    const languageKey = itemData.item;
                    const languageString = supportedLanguages[languageKey];
                    return (
                        <LanguageItem 
                            onPress={() => handleLanguageSelect(languageKey)}
                            text={languageString}
                            selected={languageKey === selected}
                        />
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});