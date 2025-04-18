const Logo = ({ size = 'medium' }) => {
    const sizes = {
      small: { containerClass: 'h-8 w-8', textClass: 'text-sm' },
      medium: { containerClass: 'h-10 w-10', textClass: 'text-base' },
      large: { containerClass: 'h-12 w-12', textClass: 'text-lg' }
    };
  
    const { containerClass, textClass } = sizes[size] || sizes.medium;
  
    return (
      <div className="flex items-center">
        <div className={`${containerClass} bg-primary rounded-md flex items-center justify-center`}>
          <span className={`${textClass} text-white font-bold`}>A</span>
        </div>
        <span className="ml-2 text-xl font-semibold text-gray-800">AppName</span>
      </div>
    );
  };
  
  export default Logo;
  