interface ColorTagProps {
  color: "white" | "black"
}

export function ColorTag({ color }: ColorTagProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        color === "white"
          ? "bg-gray-100 text-gray-800 border border-gray-300"
          : "bg-gray-800 text-white border border-gray-600"
      }`}
    >
      {color}
    </span>
  )
}
