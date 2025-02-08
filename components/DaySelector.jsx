import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import { useAppTheme } from '../hooks/colorScheme';

const local_data = [
  { value: 2, label: 'Today' },
  { value: 3, label: 'Tomorrow' },
  { value: 1, label: 'Yesterday' },
];

const DaySelector = ({ onDayChange, style }) => {
    const colors = useAppTheme();

    const [day, setDay] = useState(0);

    const handleChange = (item) => {
        const newDay = item.value;
        setDay(newDay);
        if (onDayChange) {
            onDayChange(newDay);
        }
    };

    return (
        <Dropdown
            style={[styles.dropdown, {backgroundColor: colors.boxes}]}
            containerStyle={[styles.dropdownContainer, {backgroundColor: colors.boxes}]}
            selectedTextStyle={[styles.selectedTextStyle, { color: colors.accent }]}
            placeholderStyle={[styles.selectedTextStyle, { color: colors.accent }]}
            itemTextStyle={[styles.itemText, { color: colors.text }]}
            activeColor={colors.innerBoxes}
            maxHeight={200}
            value={day}
            data={local_data}
            valueField="value"
            labelField="label"
            placeholder="Today"
            iconColor={colors.accent}
            onChange={handleChange}
        />
    );
};

export default DaySelector;

const styles = StyleSheet.create({
    dropdown: {
        padding: 12,
        paddingHorizontal: 16,
        minWidth: '45%',
        height: 50,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedTextStyle: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    itemText: {
        fontSize: 16,
        textAlign: 'center',
        padding: 5,
    },
});
