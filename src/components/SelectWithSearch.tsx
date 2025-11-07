import {Combobox} from '@headlessui/react'
import {useState} from "react";
import {ChevronUpDownIcon} from "@heroicons/react/20/solid";
import {type SearchItemProps} from "npm/components/Types";
import { classNames } from "npm/lib/utils";

const SelectWithSearch = (props: SearchItemProps) => {
    const items = props.items;
    const setSelectedItem = props.setSelectedItem;
    const selectedItem = props.selectedItem;
    const title = props.title;
    const placeholder = props.placeholder;

    const [query, setQuery] = useState('')
    const filteredItems = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

    return (
        <Combobox as="div" value={selectedItem} onChange={ e => {
            setSelectedItem(e)
        }}>
            <Combobox.Label className="block text-base font-semibold leading-6 text-gray-900">{title}</Combobox.Label>
            <div className="relative mt-2">
                <Combobox.Input
                    className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder}
                    displayValue={(item) => {
                        if (item instanceof Object && "name" in item) {
                            return item.name as string;
                        }
                        return ""
                    }}
                />
                <Combobox.Button
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                </Combobox.Button>

                {filteredItems.length > 0 && (
                    <Combobox.Options
                        className="z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {filteredItems.map((item) => (
                            <Combobox.Option
                                key={item.id}
                                value={item}
                                className={({active}) =>
                                    classNames(
                                        'cursor-default select-none py-2 pl-3 pr-9',
                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                    )
                                }
                            >
                                {({active, selected}) => (

                                    <>
                                        <span
                                            className={classNames('block truncate', selected && 'font-semibold')}>{item.name}</span>

                                        {selected && (
                                            <span
                                                className={classNames(
                                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                                    active ? 'text-white' : 'text-indigo-600'
                                                )}
                                            >

                      </span>
                                        )}
                                    </>
                                )}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </div>
        </Combobox>
    )
}

export default SelectWithSearch