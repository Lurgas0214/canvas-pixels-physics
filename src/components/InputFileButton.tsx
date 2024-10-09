import React, { MouseEventHandler, ReactElement } from 'react';

export interface IInputFileButtonProps {
    label: string;
    icon?: ReactElement;
    multiple?: boolean;
    buttonStyles?: React.CSSProperties;
    onChange: (files: FileList | null) => void;
}

const InputFileButton = (props: IInputFileButtonProps) => {
    const { label, icon, multiple, buttonStyles, onChange } = props;

    const ogButtonStyles: React.CSSProperties = {
        cursor: 'pointer',
        position: 'relative',
        border: 'solid gray 1px',
        padding: '0.25em 1em'
    };

    const labelStyles: React.CSSProperties = {
        cursor: 'pointer'
    };

    const inputStyles: React.CSSProperties = {
        display: 'none',
    };

    const onHoverEvent: MouseEventHandler<HTMLDivElement> = () => {
        if (buttonElement !== undefined) {
            hoverEvent = !hoverEvent;

            if (hoverEvent === true) {
                buttonElement.style.opacity = '0.7';
            } else {
                buttonElement.style.opacity = '1';
            }
        }
    };

    // const onClickHandler: MouseEventHandler<HTMLDivElement> = () => {
    //     inputElement?.click();
    // };

    let inputElement: HTMLInputElement | undefined = undefined;
    let buttonElement: HTMLDivElement | undefined = undefined;
    let hoverEvent: boolean = false;

    return (
        <div
            // onClick={onClickHandler}
            onMouseEnter={onHoverEvent}
            onMouseLeave={onHoverEvent}
            style={buttonStyles || ogButtonStyles}
            ref={(ref: HTMLDivElement) => {
                buttonElement = ref as HTMLDivElement;
            }}
        >
            <label htmlFor='upload' style={labelStyles}>
                <span>{icon}</span>
                {label}
            </label>
            <input id='upload' type='file'
                ref={(ref: HTMLInputElement) => {
                    inputElement = ref as HTMLInputElement;
                }}
                multiple={multiple} style={inputStyles} onChange={event => {
                    onChange(event.target.files)
                }}
            />
        </div>
    );
};

export default InputFileButton; 