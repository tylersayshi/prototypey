import { Header } from "./components/Header";
import { Playground } from "./components/Playground";

export function App() {
	return (
		<div className="flex flex-col min-h-screen w-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
			<Header />
			<Playground />
		</div>
	);
}
