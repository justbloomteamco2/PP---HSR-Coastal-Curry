export type WeatherMood = "cool" | "warm" | "mild" | "rainy";

export type LocalWeather = {
  mood: WeatherMood;
  temperatureCelsius: number;
  precipitationMm: number;
  description: string;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: unknown;
    precipitation?: unknown;
    weather_code?: unknown;
  };
};

let cachedWeather: { value: LocalWeather; expiresAt: number } | undefined;

const describeWeatherCode = (code: number) => {
  if (code >= 95) return "thunderstorm";
  if (code >= 71 && code <= 86) return "snow";
  if (code >= 51 && code <= 82) return "rain";
  if (code === 45 || code === 48) return "fog";
  return "dry";
};

const findMood = (
  temperatureCelsius: number,
  precipitationMm: number,
  weatherCode: number,
): WeatherMood => {
  if (precipitationMm > 0 || describeWeatherCode(weatherCode) === "rain") {
    return "rainy";
  }
  if (temperatureCelsius < 19) return "cool";
  if (temperatureCelsius > 29) return "warm";
  return "mild";
};

export async function getCurrentLocalWeather(): Promise<LocalWeather> {
  if (cachedWeather && Date.now() < cachedWeather.expiresAt) {
    return cachedWeather.value;
  }

  if (!navigator.geolocation) {
    throw new Error("Location access is unavailable in this browser.");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      maximumAge: 20 * 60 * 1000,
      timeout: 10_000,
    });
  });

  const { latitude, longitude } = position.coords;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,precipitation,weather_code");
  url.searchParams.set("timezone", "auto");

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8_000);
  let response: Response;

  try {
    response = await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Weather service returned ${response.status}.`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const temperature = data.current?.temperature_2m;
  const precipitation = data.current?.precipitation;
  const weatherCode = data.current?.weather_code;

  if (
    typeof temperature !== "number" ||
    !Number.isFinite(temperature) ||
    typeof precipitation !== "number" ||
    !Number.isFinite(precipitation) ||
    typeof weatherCode !== "number" ||
    !Number.isFinite(weatherCode)
  ) {
    throw new Error("The weather service returned incomplete conditions.");
  }

  const condition = describeWeatherCode(weatherCode);
  const value: LocalWeather = {
    mood: findMood(temperature, precipitation, weatherCode),
    temperatureCelsius: temperature,
    precipitationMm: precipitation,
    description:
      condition === "dry"
        ? `${Math.round(temperature)}°C nearby`
        : `${condition} · ${Math.round(temperature)}°C`,
  };

  cachedWeather = { value, expiresAt: Date.now() + 20 * 60 * 1000 };
  return value;
}
