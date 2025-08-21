<script lang="ts">
  import settingStore from "../../stores/settingStore";
  import { fetchTodaysAPOD } from "../../utils/NASA/APOD";
  import NasaLogo from "../../assets/nasa.png";

  let isApplying = $state(false);
  let apodError = $state("");
  let apiKeyInput = $state(
    $settingStore.options.wallpaper.type === "nasa"
      ? $settingStore.options.wallpaper.apiKey
      : ""
  );

  // Function to apply NASA APOD wallpaper
  async function applyNasaWallpaper() {
    if (!apiKeyInput.trim()) {
      apodError = "Please enter a NASA API key";
      return;
    }

    isApplying = true;
    apodError = "";

    try {
      const result = await fetchTodaysAPOD(apiKeyInput.trim());
      
      // Only apply images, skip videos
      if (result.media_type === "image") {
        settingStore.update((store) => {
          store.options.wallpaper = {
            type: "nasa",
            category: "apod",
            apiKey: apiKeyInput.trim(),
            url: result.hdurl || result.url, // Prefer HD version if available
          };
          return store;
        });
        apodError = "";
      } else {
        apodError = "Today's APOD is a video. Only images are supported for wallpapers.";
      }
    } catch (error) {
      console.error("Failed to fetch APOD:", error);
      apodError = "Failed to fetch APOD. Please check your API key.";
    } finally {
      isApplying = false;
    }
  }
</script>

<div class="Appearance">
  <h2 class="Appearance__header">Background</h2>

  <section class="Appearance__dynamic">
    <h3 class="Appearance__subheader">Dynamic Wallpapers</h3>
    <div class="Nasa">
      <div class="Nasa__header">
        <img src={NasaLogo} alt="NASA Logo" />
        <div class="Nasa__header--text">
          <h4>NASA Dynamic Wallpapers</h4>
          <p>
            Get stunning NASA Astronomy Pictures of the Day as your wallpaper.
            <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer">
              Get your free API key here
            </a>.
          </p>
          <label for="nasa-api-key">
            <p>
              NASA API Key <em> (required) </em>
            </p>

            <div class="Nasa__input-group">
              <input
                id="nasa-api-key"
                class="CrispInput"
                type="text"
                placeholder="Enter your NASA API key"
                bind:value={apiKeyInput}
              />
              <button
                class="CrispButton"
                onclick={applyNasaWallpaper}
                disabled={isApplying || !apiKeyInput.trim()}
              >
                {isApplying ? "Applying..." : "Apply"}
              </button>
            </div>
            
            {#if apodError}
              <p class="error">{apodError}</p>
            {/if}
            
            <p class="info">
              Don't have a NASA API key? <a href="https://api.nasa.gov/" target="_blank">Get one free here</a>
            </p>
          </label>
        </div>
      </div>
    </div>
  </section>

  <section class="Appearance__preset">
    <h3 class="Appearance__subheader">Preset Wallpapers</h3>
    <div class="Appearance__preset--content">
      {#each $settingStore.wallpapers.presets as src}
        <button
          aria-label="Select wallpaper"
          class="Appearance__preview"
          class:active={$settingStore.options.wallpaper.url === src}
          style={`background-image: url(${src})`}
          onclick={() => {
            settingStore.update((store) => {
              store.options.wallpaper = { type: "preset", url: src };
              return store;
            });
          }}
        ></button>
      {/each}
    </div>
  </section>
</div>

<style lang="scss">
  @use "../../../styles/mixins.scss" as *;
  .Appearance {
    gap: 20px;
    @include box($height: auto);
    @include make-flex($dir: column, $align: flex-start, $just: flex-start);
    &__header {
      font-size: 24px;
      color: #f4f4f4;
      font-weight: 500;
    }

    &__subheader {
      font-size: 20px;
      color: #f4f4f4;
      font-weight: 500;
      @include box($height: auto);
    }

    &__content {
      gap: 25px;
      display: grid;
      padding: 10px 0;
      font-size: 18px;
      color: #c6c5c2;
      margin-top: 10px;
      @include box($height: auto);
      grid-template-columns: 1fr 1fr;
    }

    &__preview {
      @include box($height: 150px);
      border-radius: 8px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      cursor: pointer;
      transition: all 0.3s ease;
      outline: none;
      border: none;
      &:hover {
        transform: scale(1.02);
      }
      &.active {
        box-shadow: 0 0 0 4px #338cec inset;
      }
    }

    &__preset {
      gap: 15px;
      @include box($height: auto, $width: 100%);
      @include make-flex($dir: column, $align: flex-start, $just: flex-start);

      &--content {
        gap: 15px;
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }

    &__dynamic {
      @include box($height: auto, $width: 100%);
      @include make-flex($dir: column, $align: flex-start, $just: flex-start);
      gap: 15px;
    }
  }

  .Nasa {
    width: 100%;
    padding: 13px;
    border-radius: 8px;
    color: #202020;
    background-color: #f4f4f4;

    &__header {
      display: flex;
      align-items: flex-start;
      gap: 10px;

      img {
        width: 60px;
        height: 60px;
      }

      &--text {
        display: flex;
        flex-direction: column;
        gap: 4px;

        h4 {
          font-size: 20px;
          margin: 0;
          color: #202020;
        }

        p {
          font-size: 18px;
          margin: 0;
          color: #404040;

          a {
            color: #338cec;
            text-decoration: none;
            font-weight: 500;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .error {
          color: #dc2626;
          font-size: 14px;
          margin-top: 4px;
        }

        .info {
          color: #6b7280;
          font-size: 14px;
          margin-top: 8px;
        }

        label {
          color: #202020;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;

          & > p {
            font-size: 16px;
          }
        }
      }
    }

    &__input-group {
      display: flex;
      gap: 8px;
      margin-top: 4px;

      input {
        flex: 1;
        @include box(auto, 35px);
      }

      button {
        @include box(auto, 35px);
        padding: 0 12px;
      }
    }
  }
</style>
