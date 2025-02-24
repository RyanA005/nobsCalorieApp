import { FlatList, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

const images = [
    { id: 0, URL: null, tip: null},
    { id: 1, URL: require('../assets/Images/light/home.jpg'), tip: 'Welcome to NoBs'},
    { id: 2, URL: require('../assets/Images/light/goals.jpg'), tip: 'Adjust your goals to fit your needs'},
    { id: 3, URL: require('../assets/Images/light/details.jpg'), tip: 'Get in-depth details on your intake'},
]

const SlideItem = ({ item }) => (
    <View style={[styles.item]}>
        <Text>{item.tip}</Text>
        <Image source={item.URL} style={[styles.image]} resizeMode="cover" />
    </View>
)

const FeaturesSlideshow = () => {
  return (
    <View style={[{alignItems: 'center', marginHorizontal: 'auto'}]}>
        <FlatList
            style={styles.list}
            data={images}
            renderItem={({ item }) => <SlideItem item={item} />}
            horizontal={true}
            pagingEnabled={true}
            snapToAlignment='center'
            showsHorizontalScrollIndicator={false}
        />
    </View>
  )
}

export default FeaturesSlideshow

const styles = StyleSheet.create({
    item: {
        width: 150,
        height: '330',
        marginHorizontal: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    list: {
        flexGrow: 0,
    },
})