import { useId } from 'react';

export default function Dragon({
  breathing = false,
  small = false,
}: {
  breathing?: boolean;
  small?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      className={`dragon ${breathing ? 'is-breathing' : ''} ${small ? 'dragon-small' : ''}`}
      viewBox="0 0 500 380"
      role="img"
      aria-label="Brasa, un dragón verde de alas cobrizas que echa fuego"
    >
      <defs>
        <linearGradient id={`${id}body`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#557e6a" />
          <stop offset=".58" stopColor="#244c41" />
          <stop offset="1" stopColor="#15352f" />
        </linearGradient>
        <linearGradient id={`${id}wing`} x1="0" y1="0" x2=".7" y2="1">
          <stop stopColor="#daa278" />
          <stop offset="1" stopColor="#98634e" />
        </linearGradient>
        <linearGradient id={`${id}fire`} x1="0" y1=".5" x2="1" y2=".5">
          <stop stopColor="#fff3bc" />
          <stop offset=".4" stopColor="#ffc06a" />
          <stop offset="1" stopColor="#e86338" stopOpacity=".1" />
        </linearGradient>
        <radialGradient id={`${id}glow`}>
          <stop stopColor="#ef9c62" stopOpacity=".25" />
          <stop offset="1" stopColor="#ef9c62" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="255" cy="190" r="155" fill={`url(#${id}glow)`} />
      <g className="dragon-orbit" fill="none" stroke="#d9c8b8" strokeWidth="1">
        <circle cx="250" cy="190" r="142" strokeDasharray="2 10" />
        <path
          d="M80 236a178 178 0 0 1 309-165M108 310a180 180 0 0 0 310-124"
          opacity=".5"
        />
      </g>
      <g fill="#d0a280">
        <path d="m102 110 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" />
        <path d="m398 259 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" />
        <circle cx="376" cy="67" r="2" />
        <circle cx="89" cy="276" r="2" />
      </g>
      <ellipse
        cx="249"
        cy="326"
        rx="116"
        ry="12"
        fill="#233d32"
        opacity=".09"
      />
      <g className="dragon-float">
        <path
          d="M218 244c-61 43-91 52-113 27-11-13-1-32 12-25-16 0-14 15-3 18 25 10 52-23 74-48Z"
          fill={`url(#${id}body)`}
          stroke="#21463b"
          strokeWidth="2"
        />
        <path d="m111 246-13-8 3 18 16-6" fill="#b97d59" />
        <g className="dragon-back-wing">
          <path
            d="M245 205C236 143 241 72 291 41c-7 33-1 51 10 70-25 1-24 29-23 45-19-2-21 29-20 48Z"
            fill="#344e44"
            stroke="#21463b"
            strokeWidth="3"
          />
          <path
            d="M250 200c-3-63 7-107 39-153M255 148l44-36"
            fill="none"
            stroke="#69816a"
            strokeWidth="2"
          />
        </g>
        <g className="dragon-wing">
          <path
            d="M229 222C203 165 156 126 129 70c56 8 113 28 154 88-37-9-45 8-49 23-24-10-28 12-5 41Z"
            fill={`url(#${id}wing)`}
            stroke="#264a3f"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M229 215c-22-62-58-108-96-142m25 37 112 44m-82-5 44 29"
            fill="none"
            stroke="#744f40"
            strokeWidth="2"
          />
          <path
            d="m128 70-7-15 17 13"
            fill="#e9c29a"
            stroke="#264a3f"
            strokeWidth="3"
          />
        </g>
        <path
          d="M222 193c-35 22-46 61-29 88 9 15 25 21 44 23l14 17h32l-13-17c35-6 53-30 49-61-2-20-17-41-10-69l-47-17c-21 4-23 24-40 36Z"
          fill={`url(#${id}body)`}
          stroke="#21463b"
          strokeWidth="3"
        />
        <path
          d="M278 177c-25 22-19 57-29 76-6 14-6 27 6 40 25-9 44-22 42-47-2-20-16-40-6-62Z"
          fill="#acb48b"
        />
        <path
          d="m263 205 26 8m-30 9 33 10m-38 8 39 10m-43 9 36 9"
          stroke="#778568"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="m214 277-9 28-17 13h42l16-31m51-17 7 32 20 14h-43l-13-21"
          fill="#2d5445"
          stroke="#21463b"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="m188 318 7-8 5 8m6 0 5-8 5 8m86-2 4-8 7 8m3 0 4-6 5 6"
          fill="#ebd8b5"
          stroke="#21463b"
          strokeWidth="2"
        />
        <path
          d="m241 190 9-16 8 14m-35 16 2-15 12 7m-35 23-2-14 13 4m-23 35-5-12 13-1"
          fill="#d3a375"
          stroke="#21463b"
          strokeWidth="2"
        />
        <g className="dragon-head">
          <path
            d="m266 139-10-36 30 25m10 7 8-36 13 41"
            fill="#e2c19c"
            stroke="#21463b"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M250 146c4-24 35-33 60-17l16 13 32 5c15 2 15 17 2 23l-32 8c-10 21-45 25-66 10-15-10-21-25-12-42Z"
            fill={`url(#${id}body)`}
            stroke="#21463b"
            strokeWidth="3"
          />
          <path
            d="m257 153-19-2 13 14-12 7 21 6"
            fill="#d3a375"
            stroke="#21463b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="m292 145 19 5"
            stroke="#19372f"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M293 152c4-5 10-4 14-1-2 12-12 12-14 1Z" fill="#ffce79" />
          <path d="m300 151 1 8" stroke="#1b3029" strokeWidth="3" />
          <ellipse cx="348" cy="155" rx="3" ry="2" fill="#172f28" />
          <path
            d="m327 170 28-5"
            fill="none"
            stroke="#142e27"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="m339 168 3 6 4-8" fill="#f5dfbc" />
          <path
            d="m265 139 8-5m-12 13 7-3"
            stroke="#76977a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g className="dragon-fire" style={{ transformOrigin: '354px 165px' }}>
          <path
            d="M354 165c23-13 35-5 51-20-3 10 2 16 15 12 7-3 11-7 17-9-4 12 8 14 27 13-18 8-21 21-37 18 6 5 7 9 8 12-17-5-25-13-36-11-19 5-26-10-45-15Z"
            fill={`url(#${id}fire)`}
          />
          <path
            d="M355 165c24-4 34-1 54-4l-10 8 20 4c-24 4-43-7-64-8Z"
            fill="#ffe5a3"
          />
          <circle
            className="fire-spark spark-one"
            cx="426"
            cy="138"
            r="3"
            fill="#ef9250"
          />
          <circle
            className="fire-spark spark-two"
            cx="459"
            cy="188"
            r="2"
            fill="#e67442"
          />
          <circle
            className="fire-spark spark-three"
            cx="448"
            cy="155"
            r="2"
            fill="#ef9250"
          />
        </g>
      </g>
    </svg>
  );
}
