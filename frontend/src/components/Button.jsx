
const Button = ({
                    children,
                    onClick,
                    variant = 'primary',
                    type = 'button',
                    disabled = false,
                    className = '',
                    ...props
                }) => {

    const baseStyles = `
    inline-flex items-center justify-center
    px-4 py-2 border border-transparent rounded-md shadow-sm
    text-sm font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition ease-in-out duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    let variantStyles = '';
    switch (variant) {
        case 'secondary':
            variantStyles = `
        bg-gray-200 text-gray-700 border-gray-300
        hover:bg-gray-300
        focus:ring-gray-500
      `;
            break;
        case 'danger':
            variantStyles = `
        bg-red-600 text-white border-transparent
        hover:bg-red-700
        focus:ring-red-500
      `;
            break;
        case 'success':
            variantStyles = `
          bg-green-600 text-white border-transparent
          hover:bg-green-700
          focus:ring-green-500
        `;
            break;
        case 'primary':
        default:
            variantStyles = `
        bg-blue-600 text-white border-transparent
        hover:bg-blue-700
        focus:ring-blue-500
      `;
            break;
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;